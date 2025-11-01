import { useEffect, useRef, useState } from "react";
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

interface Session {
  id: string;
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  zoomLink?: string;
  status: string;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  students: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  subjects: Array<{
    id: string;
    name: string;
  }>;
}

interface QueueSSEMessage {
  type:
    | "connected"
    | "queue_list_updated"
    | "my_queue_status"
    | "session_created";
  data?: {
    queueItems?: QueueItem[];
    inQueue?: boolean;
    queue?: QueueItem | null;
    position?: number | null;
    session?: Session;
  };
  timestamp: string;
}

interface UseQueueSSEReturn {
  isConnected: boolean;
  connectionError: string | null;
  queueItems: QueueItem[];
  myQueueStatus: {
    inQueue: boolean;
    queue: QueueItem | null;
    position: number | null;
  } | null;
  createdSession: Session | null; // Session created from queue acceptance
  reconnect: () => void;
}

export function useQueueSSE(
  userRole: "INSTRUCTOR" | "STUDENT"
): UseQueueSSEReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [myQueueStatus, setMyQueueStatus] = useState<{
    inQueue: boolean;
    queue: QueueItem | null;
    position: number | null;
  } | null>(null);
  const [createdSession, setCreatedSession] = useState<Session | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = async () => {
    try {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Get authentication token
      const token = await getToken();
      if (!token) {
        setConnectionError("No authentication token available");
        return;
      }

      // Create SSE connection with authentication
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const url = `${baseUrl}/api/sse/queue-updates`;

      // Use fetch with streaming for authentication support
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body reader available");
      }

      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const jsonData = line.slice(6); // Remove 'data: ' prefix
                  if (jsonData.trim()) {
                    const message: QueueSSEMessage = JSON.parse(jsonData);
                    console.log("SSE message received:", message);

                    switch (message.type) {
                      case "connected":
                        console.log("SSE connected successfully");
                        break;

                      case "queue_list_updated":
                        if (message.data?.queueItems) {
                          setQueueItems(message.data.queueItems);
                          console.log(
                            "Queue list updated:",
                            message.data.queueItems.length,
                            "items"
                          );
                        }
                        break;

                      case "my_queue_status":
                        if (message.data) {
                          setMyQueueStatus({
                            inQueue: message.data.inQueue || false,
                            queue: message.data.queue || null,
                            position: message.data.position || null,
                          });
                          console.log("My queue status updated:", message.data);
                        }
                        break;

                      case "session_created":
                        if (message.data?.session) {
                          setCreatedSession(message.data.session);
                          console.log("Session created:", message.data.session);
                        }
                        break;

                      default:
                        console.log("Unknown SSE message type:", message.type);
                    }
                  }
                } catch (parseError) {
                  console.error("Error parsing SSE message:", parseError);
                }
              }
            }
          }
        } catch (streamError) {
          console.error("Stream processing error:", streamError);
          setIsConnected(false);
          setConnectionError("Stream connection lost");

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
        }
      };

      processStream();
    } catch (error) {
      console.error("Failed to establish SSE connection:", error);
      setIsConnected(false);
      setConnectionError("Failed to connect to server");
    }
  };

  const reconnect = () => {
    reconnectAttempts.current = 0;
    setConnectionError(null);
    connect();
  };

  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [userRole]); // ✅ FIXED: Removed 'connect' from dependencies

  return {
    isConnected,
    connectionError,
    queueItems,
    myQueueStatus,
    createdSession,
    reconnect,
  };
}
