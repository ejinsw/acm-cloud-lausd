import { useEffect, useRef, useState, useCallback } from "react";
import { getToken } from "../actions/authentication";

interface QueueItem {
  id: number;
  description: string;
  status: string;
  createdAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  subject: {
    id: string;
    name: string;
    level: string | null;
  };
  canTeach?: boolean;
}

interface QueueWebSocketMessage {
  type: "QUEUE_SUBSCRIBED" | "QUEUE_UPDATE" | "QUEUE_UNSUBSCRIBED" | "ERROR";
  payload?: {
    type?: string;
    studentId?: string;
    sessionId?: string;
    queueData?: any;
    message?: string;
  };
}

interface UseQueueWebSocketReturn {
  isConnected: boolean;
  connectionError: string | null;
  queueItems: QueueItem[];
  reconnect: () => void;
  refreshQueue: () => Promise<void>;
}

export function useQueueWebSocket(
  userRole: "INSTRUCTOR" | "STUDENT"
): UseQueueWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const isSubscribed = useRef(false);

  // Fetch initial queue data from REST API
  const fetchQueueData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      
      // Use different endpoints based on user role
      const endpoint = userRole === "INSTRUCTOR" 
        ? `${baseUrl}/api/queue`           // Instructors get all pending queues
        : `${baseUrl}/api/queue/student`;  // Students get their own queues
      
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle different response formats
        if (userRole === "INSTRUCTOR") {
          setQueueItems(data.queueItems || []);
        } else {
          // For students, convert their queues to the same format
          const queues = data.queues || [];
          setQueueItems(queues);
        }
      } else {
        console.error(`Failed to fetch queue data: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to fetch initial queue data:", error);
    }
  }, [userRole]);

  const connect = useCallback(async () => {
    try {
      // Close existing connection
      if (wsRef.current) {
        console.log("[WS] Closing existing connection");
        wsRef.current.close();
      }

      // Get authentication token
      const token = await getToken();
      if (!token) {
        console.error("[WS] No authentication token available");
        setConnectionError("No authentication token available");
        return;
      }

      // Use the WebSocket API Gateway endpoint (provides wss:// for HTTPS compatibility)
      // The server handles both chat and queue messages on the same connection
      const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:9999";
      
      console.log("[WS] Connecting to WebSocket for queue updates");
      console.log("[WS] URL:", wsUrl);
      console.log("[WS] Environment:", {
        NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      });

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      isSubscribed.current = false;

      ws.onopen = () => {
        console.log("[WS] ✅ WebSocket connected successfully");
        console.log("[WS] ReadyState:", ws.readyState, "(1 = OPEN)");
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;

        // Identify user with token
        console.log("[WS] Sending IDENTIFY_USER message");
        ws.send(
          JSON.stringify({
            type: "IDENTIFY_USER",
            payload: { token },
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          console.log("[WS] 📨 Raw message received:", event.data);
          const message: QueueWebSocketMessage = JSON.parse(event.data);
          console.log("[WS] 📨 Parsed message:", message);

          switch (message.type) {
            case "USER_IDENTIFIED":
              console.log("[WS] ✅ User identified successfully");
              // Once identified, subscribe to queue updates
              if (!isSubscribed.current) {
                console.log("[WS] Sending SUBSCRIBE_QUEUE message");
                ws.send(JSON.stringify({ type: "SUBSCRIBE_QUEUE" }));
                isSubscribed.current = true;
              }
              break;

            case "QUEUE_SUBSCRIBED":
              console.log("[WS] ✅ Successfully subscribed to queue updates");
              // Fetch initial queue data
              fetchQueueData();
              break;

            case "QUEUE_UPDATE":
              console.log("[WS] 🔄 Queue update received:", message.payload);
              
              // Refresh queue data when update is received
              fetchQueueData();
              break;

            case "ERROR":
              console.error("[WS] ❌ Server error:", message.payload?.message);
              setConnectionError(message.payload?.message || "WebSocket error");
              break;

            // Ignore chatroom-specific messages
            case "ROOM_LIST_UPDATED":
            case "REQUEST_USER_INFO":
            case "ROOM_JOINED":
            case "USER_JOINED":
            case "USER_LEFT":
            case "NEW_MESSAGE":
            case "MESSAGE_DELETED":
            case "USER_KICKED":
            case "YOU_LEFT_ROOM":
            case "YOU_WERE_KICKED":
              // Silently ignore chatroom messages
              break;

            default:
              console.log("[WS] ⚠️  Unknown message type:", message.type);
          }
        } catch (error) {
          console.error("[WS] ❌ Error parsing message:", error);
          console.error("[WS] Raw data:", event.data);
        }
      };

      ws.onerror = (error) => {
        console.error("[WS] ❌ WebSocket error event:", error);
        console.error("[WS] Error details:", {
          type: error.type,
          target: error.target,
          readyState: wsRef.current?.readyState,
        });
        setConnectionError("WebSocket connection error");
      };

      ws.onclose = (event) => {
        console.log("[WS] 🔌 WebSocket closed");
        console.log("[WS] Close details:", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });
        setIsConnected(false);
        isSubscribed.current = false;

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );
          console.log(
            `[WS] 🔄 Attempting to reconnect in ${delay}ms (attempt ${
              reconnectAttempts.current + 1
            }/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          console.error("[WS] ❌ Failed to reconnect after maximum attempts");
          setConnectionError("Failed to reconnect after multiple attempts");
        }
      };
    } catch (error) {
      console.error("[WS] ❌ Failed to establish WebSocket connection:", error);
      console.error("[WS] Error stack:", error instanceof Error ? error.stack : "No stack trace");
      setIsConnected(false);
      setConnectionError("Failed to connect to server");
    }
  }, [fetchQueueData]);

  const reconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    setConnectionError(null);
    connect();
  }, [connect]);

  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        // Unsubscribe before closing
        if (isSubscribed.current) {
          wsRef.current.send(JSON.stringify({ type: "UNSUBSCRIBE_QUEUE" }));
        }
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    isConnected,
    connectionError,
    queueItems,
    reconnect,
    refreshQueue: fetchQueueData,
  };
}
