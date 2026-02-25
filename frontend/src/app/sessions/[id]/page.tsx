"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
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
  Alert,
  Tabs,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconMessage,
  IconVideo,
  IconUsers,
  IconClock,
  IconSend,
  IconX,
} from "@tabler/icons-react";
import PageWrapper from "@/components/PageWrapper";
import ZoomMeeting from "@/components/sessions/ZoomMeeting";
import { Session, User, SessionRequest } from "@/lib/types";
import { getToken } from "@/actions/authentication";
import { useAuth } from "@/components/AuthProvider";
import { routes } from "@/app/routes";
import { useSessionWebSocket, RoomMessage, RoomUser } from "@/hooks/useSessionWebSocket";

interface LiveSessionProps {
  session: Session;
  currentUser: User;
}

const getInitials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

const LiveSession: React.FC<LiveSessionProps> = ({ session, currentUser }) => {
  const router = useRouter();
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState<string>("chat");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const {
    isConnected,
    connectionError,
    room,
    joinRoom,
    leaveRoom: wsLeaveRoom,
    sendMessage: wsSendMessage,
    deleteMessage: wsDeleteMessage,
    kickUser: wsKickUser,
  } = useSessionWebSocket(currentUser);

  const messages = room?.messages || [];
  const participants = room?.users || [];

  // Join room when connected
  useEffect(() => {
    if (isConnected && session.id) {
      joinRoom(session.id);
    }
  }, [isConnected, session.id, joinRoom]);

  // Show connection error notifications
  useEffect(() => {
    if (connectionError) {
      notifications.show({
        title: "Connection Error",
        message: connectionError,
        color: "red",
      });
    }
  }, [connectionError]);

  // Show connected notification when room is joined
  useEffect(() => {
    if (room) {
      notifications.show({
        title: "Connected",
        message: "Connected to live session",
        color: "green",
      });
    }
  }, [room?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const text = messageInput.trim();
    if (!text || !session.id) {
      return;
    }

    wsSendMessage(session.id, text);
    setMessageInput("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleZoomMeetingEnd = () => {
    notifications.show({
      title: "Meeting Ended",
      message: "The Zoom meeting has ended",
      color: "blue",
    });
  };

  const handleZoomError = (error: string) => {
    notifications.show({
      title: "Zoom Error",
      message: error,
      color: "red",
    });
  };

  const canJoinSession = () => {
    if (currentUser.role.toUpperCase() === "INSTRUCTOR" || currentUser.role.toUpperCase() == "ADMIN") return true;

    const request = session.students?.find(
      (student) => student.id === currentUser.id
    );

    return !!request
  };

  const handleLeaveSession = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/sessions/${session.id}/leave`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        notifications.show({
          title: "Left Session",
          message: "You have been removed from this session",
          color: "green",
        });
        router.push("/queue/join");
      } else {
        throw new Error("Failed to leave session");
      }
    } catch (error) {
      console.error("Failed to leave session:", error);
      notifications.show({
        title: "Error",
        message: "Failed to leave session",
        color: "red",
      });
    }
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
                <Text c="dimmed" ta="center">
                  You do not have permission to join this session. Please request
                  to join the session first.
                </Text>
                <Group>
                  <Button variant="outline" onClick={() => window.history.back()}>
                    Go Back
                  </Button>
                  <Button color="red" onClick={handleLeaveSession}>
                    Leave Session
                  </Button>
                </Group>
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
        <Paper p="xl" radius="md" mb="lg">
          <Grid>
            <Grid.Col span={8}>
              <Stack gap="xs">
                <Title order={1}>{session.name}</Title>
                <Text color="dimmed">{session.description}</Text>
                <Group gap="lg">
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

                  {typeof session.maxAttendees === "number" && (
                    <Group gap="xs">
                      <IconUsers size={16} />
                      <Text size="sm">
                        {participants.length}/{session.maxAttendees} participants
                      </Text>
                    </Group>
                  )}
                </Group>
              </Stack>
            </Grid.Col>

            <Grid.Col span={4}>
              <Stack align="flex-end" gap="md">
                <Badge
                  color={isConnected ? "green" : "red"}
                  variant="light"
                  size="lg"
                >
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
                {session.zoomLink && (
                  <Text size="sm" color="dimmed" ta="right">
                    Embedded video meeting available
                  </Text>
                )}
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>

        <Grid>
          <Grid.Col span={8}>
            <Paper p="xl" radius="md" h={600}>
              <Tabs
                value={activeTab}
                onChange={(value) => value && setActiveTab(value)}
                h="100%"
              >
                <Tabs.List>
                  <Tabs.Tab value="chat" leftSection={<IconMessage size={16} />}>
                    Chat
                  </Tabs.Tab>
                  <Tabs.Tab value="video" leftSection={<IconVideo size={16} />}>
                    Video Meeting
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="chat" pt="md" h="calc(100% - 40px)">
                  <Stack gap="md" h="100%">
                    <Group justify="space-between">
                      <Title order={3}>Session Chat</Title>
                      <Text size="sm" color="dimmed">
                        {participants.length} participants online
                      </Text>
                    </Group>

                    <Divider />

                    <ScrollArea h={400}>
                      <Stack gap="xs">
                        {messages.length === 0 ? (
                          <Center h={200}>
                            <Text color="dimmed">
                              No messages yet. Start the conversation!
                            </Text>
                          </Center>
                        ) : (
                          messages.map((message) => {
                            const isCurrentUser =
                              message.sender.id === currentUser.id;
                            return (
                              <Box
                                key={message.id}
                                style={{
                                  display: "flex",
                                  flexDirection: isCurrentUser
                                    ? "row-reverse"
                                    : "row",
                                  alignItems: "flex-start",
                                  gap: "var(--mantine-spacing-xs)",
                                }}
                              >
                                <Avatar size="sm" radius="xl">
                                  {getInitials(message.sender.username)}
                                </Avatar>
                                <Box
                                  style={{
                                    maxWidth: "70%",
                                    backgroundColor: isCurrentUser
                                      ? "var(--mantine-color-blue-6)"
                                      : "var(--mantine-color-gray-2)",
                                    color: isCurrentUser ? "white" : "inherit",
                                    padding: "var(--mantine-spacing-xs)",
                                    borderRadius: "var(--mantine-radius-md)",
                                  }}
                                >
                                  <Group gap="xs" mb={4}>
                                    <Text size="sm" fw={500}>
                                      {message.sender.username}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                      {message.createdAt
                                        ? new Date(message.createdAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                        : ""}
                                    </Text>
                                  </Group>
                                  <Text size="sm">{message.text}</Text>
                                </Box>
                              </Box>
                            );
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </Stack>
                    </ScrollArea>

                    <Divider />

                    <Group gap="xs">
                      <TextInput
                        placeholder="Type your message..."
                        value={messageInput}
                        onChange={(event) => setMessageInput(event.target.value)}
                        onKeyDown={handleKeyDown}
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

          <Grid.Col span={4}>
            <Stack gap="md">
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
                          <Group key={participant.id} gap="xs">
                            <Avatar size="sm" radius="xl">
                              {getInitials(participant.username)}
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

              {Array.isArray(session.materials) &&
                session.materials.length > 0 && (
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

              {Array.isArray(session.objectives) &&
                session.objectives.length > 0 && (
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
        if (!sessionId) throw new Error("Missing session id");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${encodeURIComponent(
            sessionId
          )}`,
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
                <Text c="dimmed" ta="center">
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
