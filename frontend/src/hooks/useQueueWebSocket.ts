import { useEffect, useRef, useState, useCallback } from "react";
import { getToken } from "../actions/authentication";

interface QueueItem {
  id: number;
  description: string;
  status: string;
  createdAt: string;
  studentId?: string; // Direct field from student endpoint
  subjectId?: string; // Direct field from student endpoint
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  subject?: {
    id: string;
    name: string;
    level: string | null;
  };
  canTeach?: boolean;
}

interface QueueWebSocketMessage {
  type: "QUEUE_SUBSCRIBED" | "QUEUE_JOIN" | "QUEUE_LEAVE" | "QUEUE_ACCEPTED" | "QUEUE_UNSUBSCRIBED" | "ERROR";
  payload?: {
    sessionId?: string;
    queueItem?: any;
    queueId?: number;
    studentId?: string;
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
  const isConnecting = useRef(false);

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
        console.log("[Queue Hook] Fetched queue data:", data);
        
        // Handle different response formats
        if (userRole === "INSTRUCTOR") {
          setQueueItems(data.queueItems || []);
        } else {
          // For students, the backend should return queues with student and subject included
          const queues = data.queues || [];
          console.log("[Queue Hook] Student queues:", queues);
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
    // Prevent multiple simultaneous connection attempts
    if (isConnecting.current) {
      console.log("[WS] Already connecting, skipping duplicate connection attempt");
      return;
    }
    
    isConnecting.current = true;
    
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
        isConnecting.current = false; // Reset connecting flag

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

            case "QUEUE_JOIN":
              console.log("[WS] 👋 Student joined queue:", message.payload);
              // Refetch queue data to get updated list
              fetchQueueData();
              break;

            case "QUEUE_LEAVE":
              console.log("[WS] 👋 Student left queue:", message.payload);
              // Refetch queue data to get updated list
              fetchQueueData();
              break;

            case "QUEUE_ACCEPTED":
              console.log("[WS] 🎉 Queue accepted! Redirecting to session:", message.payload?.sessionId);
              // Student's queue was accepted - redirect to session
              if (message.payload?.sessionId && typeof window !== 'undefined') {
                window.location.href = `/sessions/${message.payload.sessionId}`;
              }
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
        
        // No auto-reconnect - let the user refresh the page if needed
        console.log("[WS] Connection closed. Refresh the page to reconnect.");
      };
    } catch (error) {
      console.error("[WS] ❌ Failed to establish WebSocket connection:", error);
      console.error("[WS] Error stack:", error instanceof Error ? error.stack : "No stack trace");
      setIsConnected(false);
      setConnectionError("Failed to connect to server");
      isConnecting.current = false; // Reset connecting flag on error
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
      console.log("[WS] Cleaning up WebSocket connection");
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        // Unsubscribe before closing
        if (isSubscribed.current && wsRef.current.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.send(JSON.stringify({ type: "UNSUBSCRIBE_QUEUE" }));
          } catch (error) {
            console.error("[WS] Error unsubscribing:", error);
          }
        }
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only connect once on mount

  return {
    isConnected,
    connectionError,
    queueItems,
    reconnect,
    refreshQueue: fetchQueueData,
  };
}
