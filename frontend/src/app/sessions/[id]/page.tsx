"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Title,
  Paper,
  Stack,
  Text,
  Badge,
  Button,
  Group,
  Box,
  Loader,
  Center,
  TextInput,
  ScrollArea,
  Avatar,
  ActionIcon,
  Drawer,
  Collapse,
  Modal,
  em,
} from "@mantine/core";
import { useMediaQuery, useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconVideo,
  IconUsers,
  IconSend,
  IconX,
  IconChevronDown,
  IconChevronUp,
  IconDots,
  IconSettings,
  IconShield,
} from "@tabler/icons-react";
import PageWrapper from "@/components/PageWrapper";
import ZoomMeeting from "@/components/sessions/ZoomMeeting";
import SessionSettingsDrawer from "@/components/sessions/SessionSettingsDrawer";
import SessionAdminControls from "@/components/sessions/SessionAdminControls";
import { Session, User } from "@/lib/types";
import { getToken } from "@/actions/authentication";
import { useAuth } from "@/components/AuthProvider";
import { routes } from "@/app/routes";
import { useSessionWebSocket } from "@/hooks/useSessionWebSocket";

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
  const [localSession, setLocalSession] = useState<Session>(session);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMediaQuery(`(max-width: ${em(768)})`);
  
  const [participantsOpened, { open: openParticipants, close: closeParticipants }] = useDisclosure(false);
  const [videoOpened, { open: openVideo, close: closeVideo }] = useDisclosure(false);
  const [settingsOpened, { open: openSettings, close: closeSettings }] = useDisclosure(false);
  const [adminOpened, { open: openAdmin, close: closeAdmin }] = useDisclosure(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  const refetchSession = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${session.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch session");
      }

      const data = await response.json();
      setLocalSession(data.session as Session);
      console.log("[Session] Refetched session data:", data.session);
    } catch (error) {
      console.error("Failed to refetch session:", error);
    }
  }, [session.id]);

  const handleSessionEnded = useCallback(() => {
    console.log("[Session] Session ended, redirecting...");
    setTimeout(() => {
      if (currentUser.role == 'STUDENT'){
        router.push(routes.joinQueue);
      } else {
        router.push(routes.instructorQueue);
      }
    }, 3000);
  }, [router]);

  const {
    isConnected,
    connectionError,
    room,
    joinRoom,
    leaveRoom: wsLeaveRoom,
    sendMessage: wsSendMessage,
    deleteMessage: wsDeleteMessage,
    kickUser: wsKickUser,
    notifySessionUpdate,
  } = useSessionWebSocket(currentUser, {
    onSessionUpdated: refetchSession,
    onSessionEnded: handleSessionEnded,
  });

  const messages = room?.messages || [];
  const participants = room?.users || [];
  const isInstructor = currentUser.role === "INSTRUCTOR" || currentUser.role === "ADMIN";

  // Join room when connected
  useEffect(() => {
    if (isConnected && localSession.id) {
      joinRoom(localSession.id);
    }
  }, [isConnected, localSession.id, joinRoom]);

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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update local session when prop changes
  useEffect(() => {
    setLocalSession(session);
  }, [session]);

  const handleSessionUpdated = async () => {
    await refetchSession();
    notifySessionUpdate(localSession.id);
  };

  const handleDeleteMessage = (messageId: string) => {
    wsDeleteMessage(session.id, messageId);
  };

  const handleKickUser = (userId: string) => {
    wsKickUser(session.id, userId);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const text = messageInput.trim();
    if (!text || !localSession.id) {
      return;
    }

    wsSendMessage(localSession.id, text);
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

    const request = localSession.students?.find(
      (student) => student.id === currentUser.id
    );

    return !!request
  };

  const handleLeaveSession = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/sessions/${localSession.id}/leave`,
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

  // Mobile chat room UI
  if (isMobile) {
    return (
      <Box
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          background: "var(--mantine-color-body)",
        }}
      >
        {/* Mobile Header */}
        <Paper
          p="md"
          radius={0}
          style={{
            borderBottom: "1px solid var(--mantine-color-default-border)",
            flexShrink: 0,
            zIndex: 100,
          }}
        >
          <Stack gap="xs">
            <Group justify="space-between" wrap="nowrap">
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text size="lg" fw={600} truncate="end">
                  {localSession.name}
                </Text>
                <Group gap="xs">
                  <Badge
                    size="xs"
                    color={isConnected ? "green" : "red"}
                    variant="dot"
                  >
                    {isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                  <Text size="xs" c="dimmed">
                    {participants.length} online
                  </Text>
                </Group>
              </Box>
              <Group gap="xs">
                {localSession.zoomLink && (
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    size="lg"
                    onClick={openVideo}
                  >
                    <IconVideo size={20} />
                  </ActionIcon>
                )}
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  onClick={openParticipants}
                >
                  <IconUsers size={20} />
                </ActionIcon>
                {isInstructor && (
                  <>
                    <ActionIcon
                      variant="subtle"
                      color="orange"
                      size="lg"
                      onClick={openAdmin}
                    >
                      <IconShield size={20} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="lg"
                      onClick={openSettings}
                    >
                      <IconSettings size={20} />
                    </ActionIcon>
                  </>
                )}
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  onClick={() => setHeaderCollapsed(!headerCollapsed)}
                >
                  {headerCollapsed ? (
                    <IconChevronDown size={20} />
                  ) : (
                    <IconChevronUp size={20} />
                  )}
                </ActionIcon>
              </Group>
            </Group>

            <Collapse in={!headerCollapsed}>
              <Stack gap="xs" mt="xs">
                <Text size="sm" c="dimmed" lineClamp={2}>
                  {localSession.description}
                </Text>
                <Group gap="xs">
                  <Badge
                    size="xs"
                    color={localSession.status === "IN_PROGRESS" ? "green" : "blue"}
                    variant="light"
                  >
                    {localSession.status || "SCHEDULED"}
                  </Badge>
                </Group>
              </Stack>
            </Collapse>
          </Stack>
        </Paper>

        {/* Messages Area */}
        <Box
          style={{
            flex: 1,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <ScrollArea
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            type="auto"
          >
            <Box p="md" pb="xl">
              <Stack gap="md">
                {messages.length === 0 ? (
                  <Center h={200}>
                    <Stack align="center" gap="xs">
                      <Text size="sm" c="dimmed" ta="center">
                        No messages yet
                      </Text>
                      <Text size="xs" c="dimmed" ta="center">
                        Start the conversation!
                      </Text>
                    </Stack>
                  </Center>
                ) : (
                  messages.map((message) => {
                    const isCurrentUser = message.sender.id === currentUser.id;
                    return (
                      <Group
                        key={message.id}
                        gap="xs"
                        align="flex-start"
                        style={{
                          flexDirection: isCurrentUser ? "row-reverse" : "row",
                        }}
                      >
                        {!isCurrentUser && (
                          <Avatar size="sm" radius="xl">
                            {getInitials(message.sender.username)}
                          </Avatar>
                        )}
                        <Stack
                          gap={4}
                          style={{
                            maxWidth: "75%",
                            alignItems: isCurrentUser ? "flex-end" : "flex-start",
                          }}
                        >
                          {!isCurrentUser && (
                            <Text size="xs" fw={500} c="dimmed">
                              {message.sender.username}
                            </Text>
                          )}
                          <Box
                            style={{
                              backgroundColor: isCurrentUser
                                ? "var(--mantine-color-blue-6)"
                                : "var(--mantine-color-gray-2)",
                              color: isCurrentUser ? "white" : "inherit",
                              padding: "10px 14px",
                              borderRadius: "18px",
                              borderTopLeftRadius: !isCurrentUser ? "4px" : "18px",
                              borderTopRightRadius: isCurrentUser ? "4px" : "18px",
                            }}
                          >
                            <Text size="sm" style={{ wordBreak: "break-word" }}>
                              {message.text}
                            </Text>
                          </Box>
                          <Text size="xs" c="dimmed">
                            {message.createdAt
                              ? new Date(message.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </Text>
                        </Stack>
                      </Group>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Stack>
            </Box>
          </ScrollArea>
        </Box>

        {/* Message Input - Above BottomNav */}
        <Paper
          p="md"
          radius={0}
          style={{
            borderTop: "1px solid var(--mantine-color-default-border)",
            flexShrink: 0,
            background: "var(--mantine-color-body)",
            marginBottom: "calc(60px + env(safe-area-inset-bottom))", // Height of BottomNav
          }}
        >
          <Group gap="xs" wrap="nowrap">
            <TextInput
              placeholder="Message..."
              value={messageInput}
              onChange={(event) => setMessageInput(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isConnected}
              radius="xl"
              size="md"
              style={{ flex: 1 }}
            />
            <ActionIcon
              size="lg"
              radius="xl"
              color="blue"
              variant="filled"
              onClick={sendMessage}
              disabled={!isConnected || !messageInput.trim()}
            >
              <IconSend size={18} />
            </ActionIcon>
          </Group>
        </Paper>

        {/* Participants Drawer */}
        <Drawer
          opened={participantsOpened}
          onClose={closeParticipants}
          title="Participants"
          position="right"
          size="sm"
        >
          <Stack gap="md">
            {participants.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center">
                No participants yet
              </Text>
            ) : (
              participants.map((participant) => (
                <Group key={participant.id} gap="sm">
                  <Avatar size="md" radius="xl">
                    {getInitials(participant.username)}
                  </Avatar>
                  <Box style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>
                      {participant.username}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {participant.type.toUpperCase()}
                    </Text>
                  </Box>
                          {participant.id === localSession.instructorId && (
                            <Badge size="xs" color="blue">
                              Instructor
                            </Badge>
                          )}
                </Group>
              ))
            )}
          </Stack>
        </Drawer>

        {/* Video Modal */}
        <Modal
          opened={videoOpened}
          onClose={closeVideo}
          title="Video Meeting"
          size="xl"
          fullScreen={isMobile}
        >
          {localSession.zoomLink ? (
            <Box style={{ height: "70vh" }}>
              <ZoomMeeting
                sessionId={localSession.id}
                userName={`${currentUser.firstName} ${currentUser.lastName}`}
                userEmail={currentUser.email}
                onMeetingEnd={handleZoomMeetingEnd}
                onError={handleZoomError}
              />
            </Box>
          ) : (
            <Center h={200}>
              <Text c="dimmed">No video meeting available</Text>
            </Center>
          )}
        </Modal>

        {/* Settings Drawer */}
        {isInstructor && (
          <SessionSettingsDrawer
            opened={settingsOpened}
            onClose={closeSettings}
            session={localSession}
            onSessionUpdated={handleSessionUpdated}
          />
        )}

        {/* Admin Controls Drawer */}
        {isInstructor && (
          <Drawer
            opened={adminOpened}
            onClose={closeAdmin}
            title="Admin Controls"
            position="right"
            size="md"
          >
            <SessionAdminControls
              sessionId={localSession.id}
              currentUserId={currentUser.id}
              messages={messages}
              participants={participants}
              onDeleteMessage={handleDeleteMessage}
              onKickUser={handleKickUser}
              onSessionUpdated={handleSessionUpdated}
            />
          </Drawer>
        )}
      </Box>
    );
  }

  // Desktop layout
  return (
    <PageWrapper>
      <Container size="xl" py="xl">
        {/* Desktop Header */}
        <Paper p="xl" radius="md" mb="lg">
          <Group justify="space-between" wrap="wrap">
            <Stack gap="xs" style={{ flex: 1 }}>
              <Title order={2}>{localSession.name}</Title>
              <Text size="sm" c="dimmed">
                {localSession.description}
              </Text>
              <Group gap="md">
                <Badge
                  color={localSession.status === "IN_PROGRESS" ? "green" : "blue"}
                  variant="light"
                >
                  {localSession.status || "SCHEDULED"}
                </Badge>
                <Badge
                  color={isConnected ? "green" : "red"}
                  variant="light"
                >
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
                <Group gap="xs">
                  <IconUsers size={16} />
                  <Text size="sm">{participants.length} participants</Text>
                </Group>
              </Group>
            </Stack>
            <Group gap="sm">
              {localSession.zoomLink && (
                <Button
                  leftSection={<IconVideo size={16} />}
                  variant="light"
                  onClick={openVideo}
                >
                  Join Video
                </Button>
              )}
              {isInstructor && (
                <>
                  <Button
                    leftSection={<IconShield size={16} />}
                    variant="light"
                    color="orange"
                    onClick={openAdmin}
                  >
                    Admin
                  </Button>
                  <Button
                    leftSection={<IconSettings size={16} />}
                    variant="light"
                    onClick={openSettings}
                  >
                    Settings
                  </Button>
                </>
              )}
            </Group>
          </Group>
        </Paper>

        <Group align="flex-start" gap="lg">
          {/* Chat Area */}
          <Paper
            p="xl"
            radius="md"
            style={{ flex: 1, height: "calc(100vh - 300px)", minHeight: 500 }}
          >
            <Stack gap="md" h="100%">
              <Group justify="space-between">
                <Title order={3}>Chat</Title>
                <Text size="sm" c="dimmed">
                  {participants.length} online
                </Text>
              </Group>

              <ScrollArea style={{ flex: 1 }} viewportRef={messagesEndRef}>
                <Stack gap="md">
                  {messages.length === 0 ? (
                    <Center h={200}>
                      <Text c="dimmed">No messages yet. Start the conversation!</Text>
                    </Center>
                  ) : (
                    messages.map((message) => {
                      const isCurrentUser = message.sender.id === currentUser.id;
                      return (
                        <Group
                          key={message.id}
                          gap="sm"
                          align="flex-start"
                          style={{
                            flexDirection: isCurrentUser ? "row-reverse" : "row",
                          }}
                        >
                          <Avatar size="sm" radius="xl">
                            {getInitials(message.sender.username)}
                          </Avatar>
                          <Stack gap={4} style={{ maxWidth: "70%" }}>
                            <Group gap="xs">
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
                            <Box
                              style={{
                                backgroundColor: isCurrentUser
                                  ? "var(--mantine-color-blue-6)"
                                  : "var(--mantine-color-gray-2)",
                                color: isCurrentUser ? "white" : "inherit",
                                padding: "8px 12px",
                                borderRadius: "var(--mantine-radius-md)",
                              }}
                            >
                              <Text size="sm">{message.text}</Text>
                            </Box>
                          </Stack>
                        </Group>
                      );
                    })
                  )}
                </Stack>
              </ScrollArea>

              <Group gap="xs">
                <TextInput
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(event) => setMessageInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!isConnected}
                  style={{ flex: 1 }}
                  size="md"
                />
                <ActionIcon
                  size="lg"
                  color="blue"
                  variant="filled"
                  onClick={sendMessage}
                  disabled={!isConnected || !messageInput.trim()}
                >
                  <IconSend size={18} />
                </ActionIcon>
              </Group>
            </Stack>
          </Paper>

          {/* Sidebar */}
          <Stack gap="md" style={{ width: 300 }}>
            <Paper p="md" radius="md">
              <Stack gap="md">
                <Group gap="xs">
                  <IconUsers size={18} />
                  <Text fw={600}>Participants</Text>
                </Group>
                <ScrollArea h={300}>
                  <Stack gap="sm">
                    {participants.length === 0 ? (
                      <Text size="sm" c="dimmed" ta="center">
                        No participants yet
                      </Text>
                    ) : (
                      participants.map((participant) => (
                        <Group key={participant.id} gap="sm">
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
                              Host
                            </Badge>
                          )}
                        </Group>
                      ))
                    )}
                  </Stack>
                </ScrollArea>
              </Stack>
            </Paper>

            {Array.isArray(localSession.materials) && localSession.materials.length > 0 && (
              <Paper p="md" radius="md">
                <Stack gap="sm">
                  <Text fw={600}>Materials</Text>
                  <Stack gap="xs">
                    {localSession.materials.map((material, index) => (
                      <Text key={index} size="sm">
                        • {material}
                      </Text>
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            )}

            {Array.isArray(localSession.objectives) && localSession.objectives.length > 0 && (
              <Paper p="md" radius="md">
                <Stack gap="sm">
                  <Text fw={600}>Objectives</Text>
                  <Stack gap="xs">
                    {localSession.objectives.map((objective, index) => (
                      <Text key={index} size="sm">
                        • {objective}
                      </Text>
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            )}
          </Stack>
        </Group>

        {/* Desktop Video Modal */}
        <Modal
          opened={videoOpened}
          onClose={closeVideo}
          title="Video Meeting"
          size="xl"
        >
          {localSession.zoomLink ? (
            <Box style={{ height: "70vh" }}>
              <ZoomMeeting
                sessionId={localSession.id}
                userName={`${currentUser.firstName} ${currentUser.lastName}`}
                userEmail={currentUser.email}
                onMeetingEnd={handleZoomMeetingEnd}
                onError={handleZoomError}
              />
            </Box>
          ) : (
            <Center h={200}>
              <Text c="dimmed">No video meeting available</Text>
            </Center>
          )}
        </Modal>

        {/* Settings Drawer */}
        {isInstructor && (
          <SessionSettingsDrawer
            opened={settingsOpened}
            onClose={closeSettings}
            session={localSession}
            onSessionUpdated={handleSessionUpdated}
          />
        )}

        {/* Admin Controls Drawer */}
        {isInstructor && (
          <Drawer
            opened={adminOpened}
            onClose={closeAdmin}
            title="Admin Controls"
            position="right"
            size="md"
          >
            <SessionAdminControls
              sessionId={localSession.id}
              currentUserId={currentUser.id}
              messages={messages}
              participants={participants}
              onDeleteMessage={handleDeleteMessage}
              onKickUser={handleKickUser}
              onSessionUpdated={handleSessionUpdated}
            />
          </Drawer>
        )}
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
