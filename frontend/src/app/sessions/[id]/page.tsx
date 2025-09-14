'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconMessage, IconVideo, IconUsers, IconClock, IconSend, IconX } from '@tabler/icons-react';
import PageWrapper from '@/components/PageWrapper';
import { Session, User, SessionRequest } from '@/lib/types';
import { getToken } from '@/actions/authentication';
import { useAuth } from '@/components/AuthProvider';
import { routes } from '@/app/routes';

interface Message {
  id: string;
  sender: User;
  text: string;
  timestamp: string;
  type: 'message' | 'system';
}

interface LiveSessionProps {
  session: Session;
  currentUser: User;
}

const LiveSession: React.FC<LiveSessionProps> = ({ session, currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<User[]>([]);
  const [showZoomModal, setShowZoomModal] = useState(false);

  // Keep socket in a ref to avoid re-renders and stale cleanup
  const wsRef = useRef<WebSocket | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!session.id || !currentUser.id) return;

    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? 'ws://localhost:3001';
    const ws = new WebSocket(
      `${wsUrl}?sessionId=${session.id}&userId=${currentUser.id}&userType=${currentUser.role.toLowerCase()}`
    );

    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      notifications.show({
        title: 'Connected',
        message: 'Connected to live session',
        color: 'green',
      });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'message':
            // Expecting data.message to already be in Message shape
            setMessages((prev) => [...prev, data.message as Message]);
            break;

          case 'participant_joined':
            setParticipants((prev) => [...prev, data.user as User]);
            notifications.show({
              title: 'Participant Joined',
              message: `${data.user.firstName} ${data.user.lastName} joined the session`,
              color: 'blue',
            });
            break;

          case 'participant_left':
            setParticipants((prev) => prev.filter((p) => p.id !== data.userId));
            notifications.show({
              title: 'Participant Left',
              message: 'A participant left the session',
              color: 'yellow',
            });
            break;

          case 'session_started':
            notifications.show({
              title: 'Session Started',
              message: 'The instructor has started the session',
              color: 'green',
            });
            break;

          case 'session_ended':
            notifications.show({
              title: 'Session Ended',
              message: 'The session has ended',
              color: 'red',
            });
            break;

          default:
            // no-op for unknown messages
            break;
        }
      } catch (e) {
        console.error('Failed to parse WS message', e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      notifications.show({
        title: 'Disconnected',
        message: 'Lost connection to live session',
        color: 'red',
      });
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      notifications.show({
        title: 'Connection Error',
        message: 'Failed to connect to live session',
        color: 'red',
      });
    };

    return () => {
      // Always close the exact socket we created
      ws.close();
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    };
  }, [session.id, currentUser.id, currentUser.role]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = () => {
    const ws = wsRef.current;
    if (!messageInput.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

    // Optionally: optimistic UI (uncomment if server does not echo immediately)
    // const optimistic: Message = {
    //   id: Date.now().toString(),
    //   sender: currentUser,
    //   text: messageInput.trim(),
    //   timestamp: new Date().toISOString(),
    //   type: 'message',
    // };
    // setMessages((prev) => [...prev, optimistic]);

    ws.send(
      JSON.stringify({
        type: 'send_message',
        message: {
          sessionId: session.id,
          text: messageInput.trim(),
          senderId: currentUser.id,
        },
      })
    );

    setMessageInput('');
  };

  // Handle Enter key press (without Shift)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Join Zoom meeting
  const joinZoomMeeting = () => {
    if (session.zoomLink) {
      window.open(session.zoomLink, '_blank');
    } else {
      notifications.show({
        title: 'No Zoom Link',
        message: 'Zoom link not available for this session',
        color: 'yellow',
      });
    }
  };

  // Check if user can join session
  const canJoinSession = () => {
    if (currentUser.role === 'INSTRUCTOR') return true;

    const request = currentUser.sessionRequests?.find(
      (req: SessionRequest) => req.sessionId === session.id
    );

    return request?.status === 'ACCEPTED';
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
                  You don&apos;t have permission to join this session.
                  Please request to join the session first.
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
                <Text c="dimmed">{session.description}</Text>
                <Group gap="lg">
                  <Badge
                    color={session.status === 'IN_PROGRESS' ? 'green' : 'blue'}
                    variant="light"
                  >
                    {session.status || 'SCHEDULED'}
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
                        {participants.length}/{session.maxAttendees} participants
                      </Text>
                    </Group>
                  )}
                </Group>
              </Stack>
            </Grid.Col>

            <Grid.Col span={4}>
              <Stack align="flex-end" gap="md">
                <Button
                  leftSection={<IconVideo size={16} />}
                  onClick={() => setShowZoomModal(true)}
                  color="blue"
                  size="lg"
                  fullWidth
                >
                  Join Zoom Meeting
                </Button>
                <Badge color={isConnected ? 'green' : 'red'} variant="light" size="lg">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Main Content */}
        <Grid>
          {/* Chat Section */}
          <Grid.Col span={8}>
            <Paper p="xl" radius="md" h={600}>
              <Stack gap="md" h="100%">
                <Group justify="space-between">
                  <Group gap="xs">
                    <IconMessage size={20} />
                    <Title order={3}>Session Chat</Title>
                  </Group>
                  <Text size="sm" c="dimmed">
                    {participants.length} participants online
                  </Text>
                </Group>

                <Divider />

                {/* Messages */}
                <ScrollArea h={400} viewportRef={messageContainerRef}>
                  <Stack gap="xs">
                    {messages.length === 0 ? (
                      <Center h={200}>
                        <Text c="dimmed">No messages yet. Start the conversation!</Text>
                      </Center>
                    ) : (
                      messages.map((message) => {
                        const isSelf = message.sender.id === currentUser.id;
                        return (
                          <Box
                            key={message.id}
                            style={{
                              display: 'flex',
                              flexDirection: isSelf ? 'row-reverse' : 'row',
                              alignItems: 'flex-start',
                              gap: 'var(--mantine-spacing-xs)',
                            }}
                          >
                            <Avatar
                              size="sm"
                              src={message.sender.profilePicture}
                              radius="xl"
                            >
                              {message.sender.firstName?.[0]}
                              {message.sender.lastName?.[0]}
                            </Avatar>

                            <Box
                              style={{
                                maxWidth: '70%',
                                backgroundColor: isSelf
                                  ? 'var(--mantine-color-blue-6)'
                                  : 'var(--mantine-color-gray-2)',
                                color: isSelf ? 'white' : 'inherit',
                                padding: 'var(--mantine-spacing-xs)',
                                borderRadius: 'var(--mantine-radius-md)',
                              }}
                            >
                              <Group gap="xs" style={{ marginBottom: 4 }}>
                                <Text size="sm" fw={500}>
                                  {message.sender.firstName} {message.sender.lastName}
                                </Text>
                                <Text size="xs" style={{ opacity: 0.7 }}>
                                  {new Date(message.timestamp).toLocaleTimeString()}
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

                {/* Message Input */}
                <Group gap="xs">
                  <TextInput
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.currentTarget.value)}
                    onKeyDown={handleKeyDown}
                    style={{ flex: 1 }}
                    disabled={!isConnected}
                  />
                  <ActionIcon
                    size="lg"
                    color="blue"
                    onClick={sendMessage}
                    disabled={!isConnected || !messageInput.trim()}
                    variant="filled"
                    aria-label="Send message"
                  >
                    <IconSend size={16} />
                  </ActionIcon>
                </Group>
              </Stack>
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
                          <Group key={participant.id} gap="xs" wrap="nowrap">
                            <Avatar
                              size="sm"
                              src={participant.profilePicture}
                              radius="xl"
                            >
                              {participant.firstName?.[0]}
                              {participant.lastName?.[0]}
                            </Avatar>

                            <Box style={{ flex: 1, minWidth: 0 }}>
                              <Text size="sm" fw={500} truncate="end">
                                {participant.firstName} {participant.lastName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {participant.role}
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

        {/* Zoom Modal */}
        <Modal
          opened={showZoomModal}
          onClose={() => setShowZoomModal(false)}
          title="Join Zoom Meeting"
          size="md"
        >
          <Stack gap="md">
            {session.zoomLink ? (
              <>
                <Text>Click the button below to join the Zoom meeting for this session.</Text>
                <Button
                  leftSection={<IconVideo size={16} />}
                  onClick={joinZoomMeeting}
                  color="blue"
                  size="lg"
                  fullWidth
                >
                  Open Zoom Meeting
                </Button>
                <Text size="sm" c="dimmed">
                  Meeting link: {session.zoomLink}
                </Text>
              </>
            ) : (
              <Alert color="yellow" icon={<IconX size={16} />}>
                No Zoom link available for this session. Please contact the instructor.
              </Alert>
            )}
          </Stack>
        </Modal>
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
          throw new Error('Session not found');
        }

        const data = await response.json();
        setSession(data.session as Session);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session');
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
                  {error || 'Session not found'}
                </Text>
                <Button variant="outline" onClick={() => router.push(routes.exploreSessions)}>
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
