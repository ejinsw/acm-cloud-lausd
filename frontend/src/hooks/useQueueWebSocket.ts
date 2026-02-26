import { useEffect, useRef, useState, useCallback } from "react";
import { getToken } from "../actions/authentication";
import { User } from "@/lib/types";

export type QueuePriorityBand = "high" | "medium" | "low";
export type QueueDeckAction = "PASS" | "PIN";

export interface QueueItem {
  id?: number;
  description: string;
  status?: string;
  createdAt?: string;
  studentId?: string;
  subjectId?: string;
  queuePosition?: number;
  estimatedWaitMinutes?: number;
  priorityBand?: QueuePriorityBand;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    cognitoId?: string;
  };
  subject?: {
    id: string;
    name: string;
    level: string | null;
    description?: string;
    category?: string;
  };
  canTeach?: boolean;
  deckAction?: QueueDeckAction;
}

interface QueueStudentPayload {
  id?: string;
  ws?: WebSocket;
  role?: "student" | "instructor" | "admin";
  data?: QueueItem | any; // QueueItem for queue data, or any for accept data
}

interface QueueWebSocketMessage {
  type:
    | "USER_IDENTIFIED"
    | "IDENTIFY_USER"
    | "SUBSCRIBE_QUEUE"
    | "QUEUE_SUBSCRIBED"
    | "UNSUBSCRIBE_QUEUE"
    | "QUEUE_UNSUBSCRIBED"
    | "QUEUE_JOIN"
    | "QUEUE_LEAVE"
    | "ACCEPT_QUEUE"
    | "QUEUE_ACCEPTED"
    | "ERROR";
  payload?: QueueStudentPayload & {
    students?: [QueueStudentPayload];
    message?: string;
    token?: string;
  };
}

/**
 * PAYLOAD STRUCTURE CONVENTION:
 * - Queue item data is nested in `data` field: { role, data: QueueItem }
 * - QUEUE_JOIN/LEAVE: { id, role, data }
 * - QUEUE_SUBSCRIBED: { students: [...] }
 * - QUEUE_ACCEPTED: { data: { studentId, sessionId } }
 * - SUBSCRIBE/UNSUBSCRIBE_QUEUE: { role, data }
 * - ACCEPT_QUEUE: { role, data: { studentId, sessionId } }
 */

interface UseQueueWebSocketReturn {
  isConnected: boolean;
  connectionError: string | null;
  queueItems: Map<string, QueueItem>;
  queueDeckActions: Map<string, QueueDeckAction>;
  reconnect: () => void;
  subscribeQueue: (
    role: "student" | "instructor" | "admin",
    data?: QueueItem,
  ) => void;
  unsubscribeQueue: (
    role: "student" | "instructor" | "admin",
    data?: QueueItem,
  ) => void;
  acceptQueue: (studentId: string, sessionId: string) => void;
  markDeckAction: (studentId: string, action: QueueDeckAction) => void;
  clearDeckAction: (studentId: string) => void;
}

export function useQueueWebSocket(user: User | null): UseQueueWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [queueItems, setQueueItems] = useState<Map<string, QueueItem>>(
    new Map(),
  );
  const [queueDeckActions, setQueueDeckActions] = useState<
    Map<string, QueueDeckAction>
  >(new Map());

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const isSubscribed = useRef(false);
  const isConnecting = useRef(false);
  const userRef = useRef(user);
  const pendingStudentData = useRef<QueueItem | null>(null);

  // Keep userRef in sync with user prop
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const connect = useCallback(async () => {
    // Prevent multiple simultaneous connection attempts
    if (isConnecting.current) {
      console.log(
        "[WS] Already connecting, skipping duplicate connection attempt",
      );
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
      const wsUrl =
        process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:9999";

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
          }),
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
              // Only auto-subscribe for instructors and admins (they watch the queue)
              // Students should manually call subscribeQueue() with their queue data when joining
              if (!isSubscribed.current && userRef.current) {
                const role = userRef.current.role.toUpperCase();
                if (role === "INSTRUCTOR" || role === "ADMIN") {
                  console.log(`[WS] Auto-subscribing as ${role}`);
                  ws.send(
                    JSON.stringify({
                      type: "SUBSCRIBE_QUEUE",
                      payload: {
                        role: userRef.current.role.toLowerCase(),
                      },
                    }),
                  );
                  isSubscribed.current = true;
                } else {
                  console.log("[WS] Student detected - waiting for manual subscribeQueue() call with data");
                }
              }
              break;

            case "QUEUE_SUBSCRIBED":
              console.log("[WS] ✅ Successfully subscribed to queue updates");
              
              // Check if this is a student subscribing with their own data
              if (pendingStudentData.current && userRef.current) {
                const studentId = userRef.current.id;
                console.log("[WS] Adding student's own queue data to local state");
                console.log("[WS] Student ID:", studentId);
                console.log("[WS] Queue data:", pendingStudentData.current);
                setQueueItems((prev) => {
                  const newMap = new Map(prev);
                  newMap.set(studentId, pendingStudentData.current!);
                  console.log("[WS] Student added themselves. Total students:", newMap.size);
                  console.log("[WS] Queue items Map:", Array.from(newMap.entries()));
                  return newMap;
                });
                pendingStudentData.current = null; // Clear pending data
                break;
              }

              // For instructors/admins, load all students in queue
              if (!message.payload) break;
              const { students } = message.payload;

              if (!students) break;

              const queuedStudents = new Map();
              for (const student of students) {
                if (!student.data) continue;
                // Merge student.id into the data object as studentId
                const enrichedData = {
                  ...student.data,
                  studentId: student.id, // Add studentId from the parent object
                };
                queuedStudents.set(student.id, enrichedData);
              }
              setQueueItems(queuedStudents);
              console.log("[WS] Queue items loaded:", queuedStudents.size, "students");

              break;

            case "QUEUE_UNSUBSCRIBED":
              console.log(
                "[WS] ✅ Successfully unsubscribed from queue updates",
              );
              isSubscribed.current = false;
              break;

            case "QUEUE_JOIN":
              console.log("[WS] 👋 Student joined queue:", message.payload);
              if (!message.payload) break;
              const { id, role, data } = message.payload;

              if (!id || !role || !data) break;

              // Merge id into data as studentId
              const enrichedJoinData = {
                ...data,
                studentId: id,
              };

              // Create new Map to trigger React re-render
              setQueueItems((prev) => {
                const newMap = new Map(prev);
                newMap.set(id, enrichedJoinData);
                console.log("[WS] Student added to queue. Total students:", newMap.size);
                return newMap;
              });

              break;
            case "QUEUE_LEAVE":
              console.log("[WS] 👋 Student left queue:", message.payload);
              if (!message.payload?.id) break;

              // Create new Map with student removed to trigger React re-render
              const studentIdToRemove = message.payload.id;
              setQueueItems((prev) => {
                const newMap = new Map(prev);
                newMap.delete(studentIdToRemove);
                return newMap;
              });
              setQueueDeckActions((prev) => {
                const next = new Map(prev);
                next.delete(studentIdToRemove);
                return next;
              });
              break;

            case "QUEUE_ACCEPTED":
              console.log(
                "[WS] 🎉 Queue accepted! Redirecting to session:",
                message.payload?.data,
              );
              // Student's queue was accepted - redirect to session
              // Server sends: payload: { data: { studentId, sessionId } }
              if (message.payload?.data && typeof window !== "undefined") {
                const acceptData = message.payload.data as any;
                if (acceptData.sessionId) {
                  if (acceptData.studentId) {
                    setQueueDeckActions((prev) => {
                      const next = new Map(prev);
                      next.delete(acceptData.studentId);
                      return next;
                    });
                  }
                  window.location.href = `/sessions/${acceptData.sessionId}`;
                }
              }
              break;
            case "ERROR":
              console.error("[WS] ❌ Server error:", message.payload?.message);
              setConnectionError(message.payload?.message || "WebSocket error");
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
      console.error(
        "[WS] Error stack:",
        error instanceof Error ? error.stack : "No stack trace",
      );
      setIsConnected(false);
      setConnectionError("Failed to connect to server");
      isConnecting.current = false; // Reset connecting flag on error
    }
  }, []);

  const reconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    setConnectionError(null);
    connect();
  }, [connect]);

  /**
   * Subscribe to queue updates
   * @param role - User role (student, instructor, or admin)
   * @param data - Queue item data (required for students)
   *
   * Sends: { type: "SUBSCRIBE_QUEUE", payload: { role, data } }
   * Server expects: payload.role and payload.data
   */
  const subscribeQueue = useCallback(
    (role: "student" | "instructor" | "admin", data?: QueueItem) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.error("[WS] Cannot subscribe - WebSocket not connected");
        setConnectionError("WebSocket not connected");
        return;
      }

      // Store student data temporarily to add to local state after QUEUE_SUBSCRIBED
      if (role === "student" && data && userRef.current) {
        pendingStudentData.current = {
          ...data,
          studentId: userRef.current.id,
          status: "PENDING",
          createdAt: new Date().toISOString(),
        };
        console.log("[WS] Stored pending student data:", pendingStudentData.current);
      }

      console.log(`[WS] Subscribing to queue as ${role}`);
      wsRef.current.send(
        JSON.stringify({
          type: "SUBSCRIBE_QUEUE",
          payload: {
            role: role.toLowerCase(),
            data,
          },
        }),
      );
    },
    [],
  );

  /**
   * Unsubscribe from queue updates
   * @param role - User role (student, instructor, or admin)
   * @param data - Queue item data (optional)
   *
   * Sends: { type: "UNSUBSCRIBE_QUEUE", payload: { role, data } }
   * Server expects: payload.role and optional payload.data
   */
  const unsubscribeQueue = useCallback(
    (role: "student" | "instructor" | "admin", data?: QueueItem) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.error("[WS] Cannot unsubscribe - WebSocket not connected");
        return;
      }

      // Remove student from local queue items if they're leaving
      if (role === "student" && userRef.current) {
        const studentId = userRef.current.id;
        setQueueItems((prev) => {
          const newMap = new Map(prev);
          newMap.delete(studentId);
          console.log("[WS] Student removed themselves. Total students:", newMap.size);
          return newMap;
        });
        pendingStudentData.current = null; // Clear any pending data
      }

      console.log(`[WS] Unsubscribing from queue as ${role}`);
      wsRef.current.send(
        JSON.stringify({
          type: "UNSUBSCRIBE_QUEUE",
          payload: {
            role: role.toLowerCase(),
            data,
          },
        }),
      );
    },
    [],
  );

  /**
   * Accept a student's queue request (instructor/admin only)
   * @param studentId - ID of the student to accept
   * @param sessionId - Session ID to redirect student to
   *
   * Sends: { type: "ACCEPT_QUEUE", payload: { role, data: { studentId, sessionId } } }
   * Server expects: payload.role and payload.data with studentId and sessionId
   * Server responds: { type: "QUEUE_ACCEPTED", payload: { data: { studentId, sessionId } } }
   */
  const acceptQueue = useCallback((studentId: string, sessionId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("[WS] Cannot accept queue - WebSocket not connected");
      setConnectionError("WebSocket not connected");
      return;
    }

    if (!userRef.current) {
      console.error("[WS] Cannot accept queue - User not identified");
      setConnectionError("User not identified");
      return;
    }

    const role = userRef.current.role.toLowerCase();
    if (role !== "instructor" && role !== "admin") {
      console.error(
        "[WS] Only instructors and admins can accept queue requests",
      );
      setConnectionError(
        "Unauthorized - only instructors and admins can accept queue requests",
      );
      return;
    }

    console.log(`[WS] Accepting queue request for student ${studentId}`);
    wsRef.current.send(
      JSON.stringify({
        type: "ACCEPT_QUEUE",
        payload: {
          role,
          data: {
            studentId,
            sessionId,
          },
        },
      }),
    );
  }, []);

  const markDeckAction = useCallback((studentId: string, action: QueueDeckAction) => {
    setQueueDeckActions((prev) => {
      const next = new Map(prev);
      next.set(studentId, action);
      return next;
    });
  }, []);

  const clearDeckAction = useCallback((studentId: string) => {
    setQueueDeckActions((prev) => {
      const next = new Map(prev);
      next.delete(studentId);
      return next;
    });
  }, []);

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
        if (
          isSubscribed.current &&
          wsRef.current.readyState === WebSocket.OPEN
        ) {
          try {
            wsRef.current.send(
              JSON.stringify({
                type: "UNSUBSCRIBE_QUEUE",
                payload: {
                  role: userRef.current?.role.toLowerCase() ?? "student",
                },
              }),
            );
          } catch (error) {
            console.error("[WS] Error unsubscribing:", error);
          }
        }
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  return {
    isConnected,
    connectionError,
    queueItems,
    queueDeckActions,
    reconnect,
    subscribeQueue,
    unsubscribeQueue,
    acceptQueue,
    markDeckAction,
    clearDeckAction,
  };
}
