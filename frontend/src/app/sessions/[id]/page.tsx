"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Title,
  Paper,
  Grid,
  Stack,
  Text,
  Badge,
  Button,
  Group,
  Box,
  Loader,
  Center,
  Divider,
  TextInput,
  ScrollArea,
  Avatar,
  ActionIcon,
  Modal,
  Alert,
  Tabs,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconMessage,
  IconVideo,
  IconUsers,
  IconClock,
  IconMapPin,
  IconUser,
  IconSend,
  IconX,
  IconScreenShare,
} from "@tabler/icons-react";
import PageWrapper from "@/components/PageWrapper";
import ZoomMeeting from "@/components/sessions/ZoomMeeting";
import { Session, User, SessionRequest } from "@/lib/types";
import { getToken } from "@/actions/authentication";
import { useAuth } from "@/components/AuthProvider";
import { routes } from "@/app/routes";

type ChatRole = 'student' | 'instructor';

interface ChatUser {
  id: string;
  username: string;
  type: ChatRole;
}

interface ChatMessage {
  id: string;
  sender: ChatUser;
  text: string;
  timestamp: string;
  type: "message" | "system";
}

interface LiveSessionProps {
  session: Session;
  currentUser: User;
}

const LiveSession: React.FC<LiveSessionProps> = ({ session, currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const chatUser = useMemo<ChatUser>(() => {
    const displayName = [currentUser.firstName, currentUser.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    const fallbackName = displayName || currentUser.email || currentUser.id;
    const normalizedRole =
      currentUser.role === 'INSTRUCTOR' || currentUser.role === 'ADMIN'
        ? 'instructor'
        : 'student';

    return {
      id: currentUser.id,
      username: fallbackName,
      type: normalizedRole,
    };
  }, [
    currentUser.id,
    currentUser.firstName,
    currentUser.lastName,
    currentUser.email,
    currentUser.role,
  ]);

  const getInitials = (value: string) =>
    value
      .split(/\s+/)
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';

  const normalizeServerUser = useCallback((raw: unknown): ChatUser | null => {
    if (!raw || typeof raw !== 'object') return null;
    const candidate = raw as { id?: string | number; username?: string; type?: string };
    if (candidate.id === undefined || candidate.id === null) return null;

    const id = String(candidate.id);
    const username =
      (candidate.username && String(candidate.username).trim()) || `User ${id}`;
    const rawType = candidate.type ? String(candidate.type).toLowerCase() : 'student';
    const type: ChatRole = rawType === 'instructor' || rawType === 'admin' ? 'instructor' : 'student';

    return { id, username, type };
  }, []);

  const normalizeServerMessage = useCallback((raw: unknown): ChatMessage | null => {
    if (!raw || typeof raw !== 'object') return null;
    const candidate = raw as {
      id?: string | number;
      text?: string;
      timestamp?: number | string;
      sender?: unknown;
    };
    if (candidate.id === undefined || typeof candidate.text !== 'string') {
      return null;
    }

    const sender = normalizeServerUser(candidate.sender);
    if (!sender) return null;

    const timestampValue =
      typeof candidate.timestamp === 'number'
        ? candidate.timestamp
        : Number.isFinite(Date.parse(String(candidate.timestamp)))
          ? Date.parse(String(candidate.timestamp))
          : Date.now();

    return {
      id: String(candidate.id),
      sender,
      text: candidate.text,
      timestamp: timestampValue,
    };
  }, [normalizeServerUser]);

  const dedupeUsers = useCallback((users: ChatUser[]) => {
    const seen = new Map<string, ChatUser>();
    users.forEach(user => {
      seen.set(user.id, user);
    });
    return Array.from(seen.values());
  }, []);

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      const wsUrl =
        process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:3001";
      const ws = new WebSocket(
        `${wsUrl}?sessionId=${session.id}&userId=${
          currentUser.id
        }&userType=${currentUser.role.toLowerCase()}`
      );

      ws.onopen = () => {
        setIsConnected(true);
        notifications.show({
          title: "Connected",
          message: "Connected to live session",
          color: "green",
        });
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "message":
            setMessages((prev) => [...prev, data.message]);
            break;
          case "participant_joined":
            setParticipants((prev) => [...prev, data.user]);
            notifications.show({
              title: "Participant Joined",
              message: `${data.user.firstName} ${data.user.lastName} joined the session`,
              color: "blue",
            });
            break;
          case "participant_left":
            setParticipants((prev) => prev.filter((p) => p.id !== data.userId));
            notifications.show({
              title: "Participant Left",
              message: "A participant left the session",
              color: "yellow",
            });
            break;
          case "session_started":
            notifications.show({
              title: "Session Started",
              message: "The instructor has started the session",
              color: "green",
            });
            break;
          case "session_ended":
            notifications.show({
              title: "Session Ended",
              message: "The session has ended",
              color: "red",
            });
          }
          if (isRoomMissing) {
            roomMissingNotifiedRef.current = true;
            if (chatUser.type === 'instructor' && !hasAttemptedRoomCreationRef.current) {
              hasAttemptedRoomCreationRef.current = true;
              requestCreateRoom();
            }
          }
          break;
        }
        default:
          break;
      }
    };

      ws.onclose = () => {
        setIsConnected(false);
        notifications.show({
          title: "Disconnected",
          message: "Lost connection to live session",
          color: "red",
        });
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        notifications.show({
          title: "Connection Error",
          message: "Failed to connect to live session",
          color: "red",
        });
      };

      setWsConnection(ws);
    };

    if (session.id && currentUser.id) {
      connectWebSocket();
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        if (hasJoinedRoomRef.current) {
          try {
            ws.send(
              JSON.stringify({
                type: 'LEAVE_ROOM',
                payload: { roomId: session.id },
              })
            );
          } catch (error) {
            console.error('Failed to notify server about leaving room:', error);
          }
        }
        ws.close();
      } else if (ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }

      if (wsRef.current === ws) {
        wsRef.current = null;
      }
      hasJoinedRoomRef.current = false;
    };
  }, [
    session.id,
    session.name,
    chatUser.id,
    chatUser.username,
    chatUser.type,
    normalizeServerUser,
    normalizeServerMessage,
    dedupeUsers,
  ]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = () => {
    if (
      !messageInput.trim() ||
      !wsConnection ||
      wsConnection.readyState !== WebSocket.OPEN
    )
      return;

    const message: Message = {
      id: Date.now().toString(),
      sender: currentUser,
      text: messageInput.trim(),
      timestamp: new Date().toISOString(),
      type: "message",
    };

    wsConnection.send(
      JSON.stringify({
        type: "send_message",
        message: {
          sessionId: session.id,
          text: message.text,
          senderId: currentUser.id,
        },
      })
    );

    setMessageInput("");
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle Zoom meeting end
  const handleZoomMeetingEnd = () => {
    notifications.show({
      title: "Meeting Ended",
      message: "The Zoom meeting has ended",
      color: "blue",
    });
  };

  // Handle Zoom error
  const handleZoomError = (error: string) => {
    notifications.show({
      title: "Zoom Error",
      message: error,
      color: "red",
    });
  };

  // Check if user can join session
  const canJoinSession = () => {
    if (currentUser.role === "INSTRUCTOR") return true;

    const request = currentUser.sessionRequests?.find(
      (req: SessionRequest) => req.sessionId === session.id
    );

    return request?.status === "ACCEPTED";
  };

  if (!canJoinSession()) {
    return (
      <PageWrapper>
        <Container size="lg" py="xl">
          <Paper p="xl" radius="md">
            <Center>
              <Stack align="center" gap="md">
                <IconX size={48} color="red" />
                <Title order={2}>Access Denied</Title>
                <Text color="dimmed" align="center">
                  You don't have permission to join this session. Please request
                  to join the session first.
                </Text>
                <Button variant="outline" onClick={() => window.history.back()}>
                  Go Back
                </Button>
              </Stack>
            </Center>
          </Paper>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container size="xl" py="xl">
        {/* Session Header */}
        <Paper p="xl" radius="md" mb="lg">
          <Grid>
            <Grid.Col span={8}>
              <Stack gap="xs">
                <Title order={1}>{session.name}</Title>
                <Text color="dimmed">{session.description}</Text>
                <Group spacing="lg">
                  <Badge
                    color={session.status === "IN_PROGRESS" ? "green" : "blue"}
                    variant="light"
                  >
                    {session.status || "SCHEDULED"}
                  </Badge>

                  {session.startTime && (
                    <Group gap="xs">
                      <IconClock size={16} />
                      <Text size="sm">
                        {new Date(session.startTime).toLocaleString()}
                      </Text>
                    </Group>
                  )}

                  {typeof session.maxAttendees === 'number' && (
                    <Group gap="xs">
                      <IconUsers size={16} />
                      <Text size="sm">
                        {participants.length}/{session.maxAttendees}{" "}
                        participants
                      </Text>
                    </Group>
                  )}
                </Group>
              </Stack>
            </Grid.Col>

            <Grid.Col span={4}>
              <Stack align="flex-end" spacing="md">
                <Badge
                  color={isConnected ? "green" : "red"}
                  variant="light"
                  size="lg"
                >
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
                {session.zoomLink && (
                  <Text size="sm" color="dimmed" align="right">
                    Embedded video meeting available
                  </Text>
                )}
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Main Content */}
        <Grid>
          {/* Main Session Area */}
          <Grid.Col span={8}>
            <Paper p="xl" radius="md" h={600}>
              <Tabs value={activeTab} onTabChange={setActiveTab} h="100%">
                <Tabs.List>
                  <Tabs.Tab value="chat" leftIcon={<IconMessage size={16} />}>
                    Chat
                  </Tabs.Tab>
                  <Tabs.Tab value="video" leftIcon={<IconVideo size={16} />}>
                    Video Meeting
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="chat" pt="md" h="calc(100% - 40px)">
                  <Stack spacing="md" h="100%">
                    <Group position="apart">
                      <Title order={3} leftIcon={<IconMessage size={20} />}>
                        Session Chat
                      </Title>
                      <Text size="sm" color="dimmed">
                        {participants.length} participants online
                      </Text>
                    </Group>

                    <Divider />

                    {/* Messages */}
                    <ScrollArea h={400} viewportRef={messageContainerRef}>
                      <Stack spacing="xs">
                        {messages.length === 0 ? (
                          <Center h={200}>
                            <Text color="dimmed">
                              No messages yet. Start the conversation!
                            </Text>
                          </Center>
                        ) : (
                          messages.map((message) => (
                            <Box
                              key={message.id}
                              sx={{
                                display: "flex",
                                flexDirection:
                                  message.sender.id === currentUser.id
                                    ? "row-reverse"
                                    : "row",
                                alignItems: "flex-start",
                                gap: "xs",
                              }}
                            >
                              <Avatar
                                size="sm"
                                src={message.sender.profilePicture}
                                radius="xl"
                              >
                                {message.sender.firstName[0]}
                                {message.sender.lastName[0]}
                              </Avatar>
                              <Box
                                sx={{
                                  maxWidth: "70%",
                                  backgroundColor:
                                    message.sender.id === currentUser.id
                                      ? "var(--mantine-color-blue-6)"
                                      : "var(--mantine-color-gray-2)",
                                  color:
                                    message.sender.id === currentUser.id
                                      ? "white"
                                      : "inherit",
                                  padding: "xs",
                                  borderRadius: "md",
                                }}
                              >
                                <Group spacing="xs" mb={4}>
                                  <Text size="sm" weight={500}>
                                    {message.sender.firstName}{" "}
                                    {message.sender.lastName}
                                  </Text>
                                  <Text size="xs" opacity={0.7}>
                                    {new Date(
                                      message.timestamp
                                    ).toLocaleTimeString()}
                                  </Text>
                                </Group>
                                <Text size="sm">{message.text}</Text>
                              </Box>
                            </Box>
                          ))
                        )}
                        <div ref={messagesEndRef} />
                      </Stack>
                    </ScrollArea>

                    <Divider />

                    {/* Message Input */}
                    <Group spacing="xs">
                      <TextInput
                        placeholder="Type your message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        style={{ flex: 1 }}
                        disabled={!isConnected}
                      />
                      <ActionIcon
                        size="lg"
                        color="blue"
                        onClick={sendMessage}
                        disabled={!isConnected || !messageInput.trim()}
                      >
                        <IconSend size={16} />
                      </ActionIcon>
                    </Group>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="video" pt="md" h="calc(100% - 40px)">
                  {session.zoomLink ? (
                    <ZoomMeeting
                      sessionId={session.id}
                      userName={`${currentUser.firstName} ${currentUser.lastName}`}
                      userEmail={currentUser.email}
                      onMeetingEnd={handleZoomMeetingEnd}
                      onError={handleZoomError}
                    />
                  ) : (
                    <Center h="100%">
                      <Alert color="yellow" icon={<IconX size={16} />}>
                        No Zoom meeting available for this session
                      </Alert>
                    </Center>
                  )}
                </Tabs.Panel>
              </Tabs>
            </Paper>
          </Grid.Col>

          {/* Participants & Session Info */}
          <Grid.Col span={4}>
            <Stack gap="md">
              {/* Participants */}
              <Paper p="xl" radius="md">
                <Stack gap="md">
                  <Group gap="xs">
                    <IconUsers size={18} />
                    <Title order={4}>Participants</Title>
                  </Group>

                  <ScrollArea h={200}>
                    <Stack gap="xs">
                      {participants.length === 0 ? (
                        <Text size="sm" c="dimmed" ta="center">
                          No participants yet
                        </Text>
                      ) : (
                        participants.map((participant) => (
                          <Group key={participant.id} spacing="xs">
                            <Avatar
                              size="sm"
                              src={participant.profilePicture}
                              radius="xl"
                            >
                              {participant.firstName[0]}
                              {participant.lastName[0]}
                            </Avatar>

                            <Box style={{ flex: 1, minWidth: 0 }}>
                              <Text size="sm" fw={500} truncate="end">
                                {participant.username}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {participant.type.toUpperCase()}
                              </Text>
                            </Box>
                            {participant.id === session.instructorId && (
                              <Badge size="xs" color="blue">
                                Instructor
                              </Badge>
                            )}
                          </Group>
                        ))
                      )}
                    </Stack>
                  </ScrollArea>
                </Stack>
              </Paper>

              {/* Session Materials */}
              {Array.isArray(session.materials) && session.materials.length > 0 && (
                <Paper p="xl" radius="md">
                  <Stack gap="md">
                    <Title order={4}>Session Materials</Title>
                    <Stack gap="xs">
                      {session.materials.map((material, index) => (
                        <Text key={index} size="sm">
                          • {material}
                        </Text>
                      ))}
                    </Stack>
                  </Stack>
                </Paper>
              )}

              {/* Learning Objectives */}
              {Array.isArray(session.objectives) && session.objectives.length > 0 && (
                <Paper p="xl" radius="md">
                  <Stack gap="md">
                    <Title order={4}>Learning Objectives</Title>
                    <Stack gap="xs">
                      {session.objectives.map((objective, index) => (
                        <Text key={index} size="sm">
                          • {objective}
                        </Text>
                      ))}
                    </Stack>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </PageWrapper>
  );
};

// Main page component
const LiveSessionPage: React.FC = () => {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();

        if (!token) {
          router.push(routes.signIn);
          return;
        }

        const sessionId = params?.id;
        if (!sessionId) throw new Error('Missing session id');

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${encodeURIComponent(sessionId)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Session not found");
        }

        const data = await response.json();
        setSession(data.session as Session);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load session");
      } finally {
        setIsLoading(false);
      }
    };

    if (params?.id) {
      void fetchSession();
    }
  }, [params?.id, router]);

  if (isLoading) {
    return (
      <PageWrapper>
        <Container size="lg" py="xl">
          <Center h={400}>
            <Loader size="xl" />
          </Center>
        </Container>
      </PageWrapper>
    );
  }

  if (error || !session) {
    return (
      <PageWrapper>
        <Container size="lg" py="xl">
          <Paper p="xl" radius="md">
            <Center>
              <Stack align="center" gap="md">
                <IconX size={48} color="red" />
                <Title order={2}>Error</Title>
                <Text color="dimmed" align="center">
                  {error || "Session not found"}
                </Text>
                <Button
                  variant="outline"
                  onClick={() => router.push(routes.exploreSessions)}
                >
                  Back to Sessions
                </Button>
              </Stack>
            </Center>
          </Paper>
        </Container>
      </PageWrapper>
    );
  }

  if (!user) {
    return (
      <PageWrapper>
        <Container size="lg" py="xl">
          <Center h={400}>
            <Loader size="xl" />
          </Center>
        </Container>
      </PageWrapper>
    );
  }

  return <LiveSession session={session} currentUser={user} />;
};

export default LiveSessionPage;
