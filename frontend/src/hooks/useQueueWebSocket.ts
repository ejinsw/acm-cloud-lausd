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
      const response = await fetch(`${baseUrl}/api/queue`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQueueItems(data.queueItems || []);
      }
    } catch (error) {
      console.error("Failed to fetch initial queue data:", error);
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      // Close existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Get authentication token
      const token = await getToken();
      if (!token) {
        setConnectionError("No authentication token available");
        return;
      }

      // Get WebSocket URL
      const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:9999";
      const wsEndpoint = wsUrl.replace(/^http/, "ws");

      console.log("Connecting to WebSocket for queue updates:", wsEndpoint);

      const ws = new WebSocket(wsEndpoint);
      wsRef.current = ws;
      isSubscribed.current = false;

      ws.onopen = () => {
        console.log("WebSocket connected for queue updates");
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;

        // Identify user with token
        ws.send(
          JSON.stringify({
            type: "IDENTIFY_USER",
            payload: { token },
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const message: QueueWebSocketMessage = JSON.parse(event.data);
          console.log("Queue WebSocket message received:", message);

          switch (message.type) {
            case "USER_IDENTIFIED":
              // Once identified, subscribe to queue updates
              if (!isSubscribed.current) {
                ws.send(JSON.stringify({ type: "SUBSCRIBE_QUEUE" }));
                isSubscribed.current = true;
              }
              break;

            case "QUEUE_SUBSCRIBED":
              console.log("Successfully subscribed to queue updates");
              // Fetch initial queue data
              fetchQueueData();
              break;

            case "QUEUE_UPDATE":
              console.log("Queue update received:", message.payload);
              // Refresh queue data when update is received
              fetchQueueData();
              break;

            case "ERROR":
              console.error("Queue WebSocket error:", message.payload?.message);
              setConnectionError(message.payload?.message || "WebSocket error");
              break;

            default:
              console.log("Unknown queue WebSocket message type:", message.type);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionError("WebSocket connection error");
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        setIsConnected(false);
        isSubscribed.current = false;

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );
          console.log(
            `Attempting to reconnect in ${delay}ms (attempt ${
              reconnectAttempts.current + 1
            }/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          setConnectionError("Failed to reconnect after multiple attempts");
        }
      };
    } catch (error) {
      console.error("Failed to establish WebSocket connection:", error);
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
  };
}
