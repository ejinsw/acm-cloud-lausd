import { useEffect, useRef, useState, useCallback } from "react";
import { getToken } from "../actions/authentication";
import { User } from "@/lib/types";

export interface RoomUser {
  id: string;
  username: string;
  type: "student" | "instructor" | "admin";
}

export interface RoomMessage {
  id: string;
  text: string;
  sender: RoomUser;
  roomId: string;
  createdAt?: string;
}

export interface Room {
  id: string;
  name: string;
  users: RoomUser[];
  messages: RoomMessage[];
}

interface SessionWebSocketMessage {
  type:
    | "USER_IDENTIFIED"
    | "IDENTIFY_USER"
    | "REQUEST_USER_INFO"
    | "JOIN_ROOM"
    | "ROOM_JOINED"
    | "LEAVE_ROOM"
    | "YOU_LEFT_ROOM"
    | "USER_JOINED"
    | "USER_LEFT"
    | "SEND_MESSAGE"
    | "NEW_MESSAGE"
    | "DELETE_MESSAGE"
    | "MESSAGE_DELETED"
    | "KICK_USER"
    | "USER_KICKED"
    | "YOU_WERE_KICKED"
    | "ROOM_LIST_UPDATED"
    | "UPDATE_SESSION"
    | "SESSION_UPDATED"
    | "SESSION_ENDED"
    | "ERROR";
  payload?: any;
}

interface UseSessionWebSocketReturn {
  isConnected: boolean;
  connectionError: string | null;
  room: Room | null;
  reconnect: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, text: string) => void;
  deleteMessage: (roomId: string, messageId: string) => void;
  kickUser: (roomId: string, userIdToKick: string) => void;
  notifySessionUpdate: (sessionId: string) => void;
}

export function useSessionWebSocket(user: User | null): UseSessionWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const isIdentified = useRef(false);
  const isConnecting = useRef(false);
  const userRef = useRef(user);

  // Keep userRef in sync with user prop
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const connect = useCallback(async () => {
    // Prevent multiple simultaneous connection attempts
    if (isConnecting.current) {
      console.log(
        "[Session WS] Already connecting, skipping duplicate connection attempt",
      );
      return;
    }

    isConnecting.current = true;

    try {
      // Close existing connection
      if (wsRef.current) {
        console.log("[Session WS] Closing existing connection");
        wsRef.current.close();
      }

      // Get authentication token
      const token = await getToken();
      if (!token) {
        console.error("[Session WS] No authentication token available");
        setConnectionError("No authentication token available");
        return;
      }

      const wsUrl =
        process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:9999";

      console.log("[Session WS] Connecting to WebSocket for session rooms");
      console.log("[Session WS] URL:", wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      isIdentified.current = false;

      ws.onopen = () => {
        console.log("[Session WS] ✅ WebSocket connected successfully");
        console.log("[Session WS] ReadyState:", ws.readyState, "(1 = OPEN)");
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        isConnecting.current = false;

        // Identify user with token
        console.log("[Session WS] Sending IDENTIFY_USER message");
        ws.send(
          JSON.stringify({
            type: "IDENTIFY_USER",
            payload: { token },
          }),
        );
      };

      ws.onmessage = (event) => {
        try {
          console.log("[Session WS] 📨 Raw message received:", event.data);
          const message: SessionWebSocketMessage = JSON.parse(event.data);
          console.log("[Session WS] 📨 Parsed message:", message);

          switch (message.type) {
            case "REQUEST_USER_INFO":
              console.log("[Session WS] 📋 Server requested user info (already sent during IDENTIFY_USER)");
              break;

            case "USER_IDENTIFIED":
              console.log("[Session WS] ✅ User identified successfully");
              isIdentified.current = true;
              break;

            case "ROOM_LIST_UPDATED":
              console.log("[Session WS] 📋 Room list updated (ignored in session view)");
              break;

            case "ROOM_JOINED":
              console.log("[Session WS] ✅ Joined room:", message.payload);
              if (message.payload) {
                setRoom({
                  id: message.payload.id || message.payload.roomId || "",
                  name: message.payload.name || "",
                  users: message.payload.users || [],
                  messages: message.payload.messages || [],
                });
              }
              break;

            case "USER_JOINED":
              console.log("[Session WS] 👋 User joined room:", message.payload);
              if (message.payload?.user) {
                setRoom((prev) => {
                  if (!prev) return prev;
                  // Check if user already exists
                  const userExists = prev.users.some(
                    (u) => u.id === message.payload!.user!.id,
                  );
                  if (userExists) return prev;
                  return {
                    ...prev,
                    users: [...prev.users, message.payload!.user!],
                  };
                });
              }
              break;

            case "USER_LEFT":
              console.log("[Session WS] 👋 User left room:", message.payload);
              if (message.payload?.userId) {
                setRoom((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    users: prev.users.filter(
                      (u) => u.id !== message.payload!.userId,
                    ),
                  };
                });
              }
              break;

            case "YOU_LEFT_ROOM":
              console.log("[Session WS] 🚪 You left the room:", message.payload);
              setRoom(null);
              break;

            case "NEW_MESSAGE":
              console.log("[Session WS] 💬 New message received:", message.payload);
              if (message.payload) {
                const newMessage: RoomMessage = message.payload as any;
                setRoom((prev) => {
                  if (!prev) return prev;
                  // Check if message already exists
                  const messageExists = prev.messages.some(
                    (m) => m.id === newMessage.id,
                  );
                  if (messageExists) return prev;
                  return {
                    ...prev,
                    messages: [...prev.messages, newMessage],
                  };
                });
              }
              break;

            case "MESSAGE_DELETED":
              console.log("[Session WS] 🗑️ Message deleted:", message.payload);
              if (message.payload?.messageId) {
                setRoom((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    messages: prev.messages.filter(
                      (m) => m.id !== message.payload!.messageId,
                    ),
                  };
                });
              }
              break;

            case "USER_KICKED":
              console.log("[Session WS] 👢 User kicked from room:", message.payload);
              if (message.payload?.kickedUserId) {
                setRoom((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    users: prev.users.filter(
                      (u) => u.id !== message.payload!.kickedUserId,
                    ),
                  };
                });
              }
              break;

            case "YOU_WERE_KICKED":
              console.log("[Session WS] ⚠️ You were kicked from room:", message.payload);
              setRoom(null);
              setConnectionError(
                message.payload?.reason || "You were removed from the room",
              );
              break;

            case "SESSION_UPDATED":
              console.log("[Session WS] 🔄 Session updated, please refetch");
              if (typeof window !== "undefined") {
                const { notifications } = require("@mantine/notifications");
                notifications.show({
                  title: "Session Updated",
                  message: "Session details have been updated",
                  color: "blue",
                  autoClose: 3000,
                });
              }
              break;

            case "SESSION_ENDED":
              console.log("[Session WS] 🔚 Session has ended");
              setRoom(null);
              if (typeof window !== "undefined") {
                const { notifications } = require("@mantine/notifications");
                notifications.show({
                  title: "Session Ended",
                  message: "This session has been ended by the instructor",
                  color: "orange",
                  autoClose: false,
                });
              }
              break;

            case "ERROR":
              console.error("[Session WS] ❌ Server error:", message.payload?.message);
              setConnectionError(message.payload?.message || "WebSocket error");
              break;

            default:
              console.log("[Session WS] ⚠️  Unknown message type:", message.type);
          }
        } catch (error) {
          console.error("[Session WS] ❌ Error parsing message:", error);
          console.error("[Session WS] Raw data:", event.data);
        }
      };

      ws.onerror = (error) => {
        console.error("[Session WS] ❌ WebSocket error event:", error);
        console.error("[Session WS] Error details:", {
          type: error.type,
          target: error.target,
          readyState: wsRef.current?.readyState,
        });
        setConnectionError("WebSocket connection error");
      };

      ws.onclose = (event) => {
        console.log("[Session WS] 🔌 WebSocket closed");
        console.log("[Session WS] Close details:", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });

        setIsConnected(false);
        isIdentified.current = false;

        console.log("[Session WS] Connection closed. Refresh the page to reconnect.");
      };
    } catch (error) {
      console.error("[Session WS] ❌ Failed to establish WebSocket connection:", error);
      console.error(
        "[Session WS] Error stack:",
        error instanceof Error ? error.stack : "No stack trace",
      );
      setIsConnected(false);
      setConnectionError("Failed to connect to server");
      isConnecting.current = false;
    }
  }, []);

  const reconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    setConnectionError(null);
    connect();
  }, [connect]);

  /**
   * Join a session room
   * @param roomId - The session/room ID to join
   *
   * Sends: { type: "JOIN_ROOM", payload: { roomId, user } }
   * Server responds with: { type: "ROOM_JOINED", payload: { id, name, users, messages } }
   */
  const joinRoom = useCallback(
    (roomId: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.error("[Session WS] Cannot join room - WebSocket not connected");
        setConnectionError("WebSocket not connected");
        return;
      }

      if (!userRef.current) {
        console.error("[Session WS] Cannot join room - User not identified");
        setConnectionError("User not identified");
        return;
      }

      console.log(`[Session WS] Joining room: ${roomId}`);
      wsRef.current.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          payload: {
            roomId,
            user: {
              id: userRef.current.id,
              username: `${userRef.current.firstName} ${userRef.current.lastName}`,
              type: userRef.current.role.toLowerCase(),
            },
          },
        }),
      );
    },
    [],
  );

  /**
   * Leave a session room
   * @param roomId - The session/room ID to leave
   *
   * Sends: { type: "LEAVE_ROOM", payload: { roomId } }
   * Server responds with: { type: "YOU_LEFT_ROOM", payload: { roomId } }
   */
  const leaveRoom = useCallback((roomId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("[Session WS] Cannot leave room - WebSocket not connected");
      return;
    }

    console.log(`[Session WS] Leaving room: ${roomId}`);
    wsRef.current.send(
      JSON.stringify({
        type: "LEAVE_ROOM",
        payload: { roomId },
      }),
    );
  }, []);

  /**
   * Send a message to the current room
   * @param roomId - The session/room ID
   * @param text - Message text to send
   *
   * Sends: { type: "SEND_MESSAGE", payload: { roomId, text } }
   * Server broadcasts: { type: "NEW_MESSAGE", payload: RoomMessage }
   */
  const sendMessage = useCallback((roomId: string, text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("[Session WS] Cannot send message - WebSocket not connected");
      setConnectionError("WebSocket not connected");
      return;
    }

    if (!text.trim()) {
      console.error("[Session WS] Cannot send empty message");
      return;
    }

    console.log(`[Session WS] Sending message to room: ${roomId}`);
    wsRef.current.send(
      JSON.stringify({
        type: "SEND_MESSAGE",
        payload: { roomId, text },
      }),
    );
  }, []);

  /**
   * Delete a message from the room (instructor only)
   * @param roomId - The session/room ID
   * @param messageId - ID of the message to delete
   *
   * Sends: { type: "DELETE_MESSAGE", payload: { roomId, messageId } }
   * Server broadcasts: { type: "MESSAGE_DELETED", payload: { roomId, messageId, deletedBy } }
   */
  const deleteMessage = useCallback((roomId: string, messageId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("[Session WS] Cannot delete message - WebSocket not connected");
      setConnectionError("WebSocket not connected");
      return;
    }

    console.log(`[Session WS] Deleting message: ${messageId} from room: ${roomId}`);
    wsRef.current.send(
      JSON.stringify({
        type: "DELETE_MESSAGE",
        payload: { roomId, messageId },
      }),
    );
  }, []);

  /**
   * Kick a user from the room (instructor only)
   * @param roomId - The session/room ID
   * @param userIdToKick - ID of the user to kick
   *
   * Sends: { type: "KICK_USER", payload: { roomId, userIdToKick } }
   * Server broadcasts: { type: "USER_KICKED", payload: { roomId, kickedUserId, kickedUsername, kickedBy } }
   */
  const kickUser = useCallback((roomId: string, userIdToKick: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("[Session WS] Cannot kick user - WebSocket not connected");
      setConnectionError("WebSocket not connected");
      return;
    }

    if (!userRef.current) {
      console.error("[Session WS] Cannot kick user - User not identified");
      setConnectionError("User not identified");
      return;
    }

    const role = userRef.current.role.toLowerCase();
    if (role !== "instructor" && role !== "admin") {
      console.error("[Session WS] Only instructors and admins can kick users");
      setConnectionError("Unauthorized - only instructors and admins can kick users");
      return;
    }

    console.log(`[Session WS] Kicking user: ${userIdToKick} from room: ${roomId}`);
    wsRef.current.send(
      JSON.stringify({
        type: "KICK_USER",
        payload: { roomId, userIdToKick },
      }),
    );
  }, []);

  /**
   * Notify all users in a room that the session has been updated
   * @param sessionId - The session/room ID
   *
   * Sends: { type: "UPDATE_SESSION", payload: { sessionId, userId } }
   * Server broadcasts: { type: "SESSION_UPDATED", payload: { sessionId } }
   */
  const notifySessionUpdate = useCallback((sessionId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("[Session WS] Cannot notify update - WebSocket not connected");
      return;
    }

    if (!userRef.current) {
      console.error("[Session WS] Cannot notify update - User not identified");
      return;
    }

    console.log(`[Session WS] Notifying session update: ${sessionId}`);
    wsRef.current.send(
      JSON.stringify({
        type: "UPDATE_SESSION",
        payload: {
          sessionId,
          userId: userRef.current.id,
        },
      }),
    );
  }, []);

  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      console.log("[Session WS] Cleaning up WebSocket connection");
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        // Leave room before closing if in a room
        if (room && wsRef.current.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.send(
              JSON.stringify({
                type: "LEAVE_ROOM",
                payload: { roomId: room.id },
              }),
            );
          } catch (error) {
            console.error("[Session WS] Error leaving room:", error);
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
    room,
    reconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    deleteMessage,
    kickUser,
    notifySessionUpdate,
  };
}
