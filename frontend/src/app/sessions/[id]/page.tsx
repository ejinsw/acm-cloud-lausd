'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
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
  timestamp: number;
}

interface LiveSessionProps {
  session: Session;
  currentUser: User;
}

const LiveSession: React.FC<LiveSessionProps> = ({ session, currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<ChatUser[]>([]);
  const [showZoomModal, setShowZoomModal] = useState(false);

  // Keep socket in a ref to avoid re-renders and stale cleanup
  const wsRef = useRef<WebSocket | null>(null);
  const hasAttemptedRoomCreationRef = useRef(false);
  const hasJoinedRoomRef = useRef(false);
  const roomMissingNotifiedRef = useRef(false);

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
    if (!session.id || !chatUser.id) return;

    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? 'ws://localhost:3001';
    const connectionUrl = `${wsUrl}?sessionId=${encodeURIComponent(session.id)}&userId=${encodeURIComponent(chatUser.id)}&userType=${encodeURIComponent(chatUser.type)}`;
    const ws = new WebSocket(connectionUrl);

    wsRef.current = ws;
    hasAttemptedRoomCreationRef.current = false;
    hasJoinedRoomRef.current = false;
    roomMissingNotifiedRef.current = false;

    const userPayload: ChatUser = {
      id: chatUser.id,
      username: chatUser.username,
      type: chatUser.type,
    };

    const sendMessageToServer = (type: string, payload?: Record<string, unknown>) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      ws.send(
        JSON.stringify(
          payload !== undefined
            ? { type, payload }
            : { type }
        )
      );
    };

    const requestJoinRoom = () => {
      sendMessageToServer('JOIN_ROOM', {
        roomId: session.id,
        user: userPayload,
      });
    };

    const requestCreateRoom = () => {
      sendMessageToServer('CREATE_ROOM', {
        roomName: session.name || `Session ${session.id}`,
        user: userPayload,
      });
    };

    ws.onopen = () => {
      setIsConnected(true);
      notifications.show({
        title: 'Connected',
        message: 'Connected to live session',
        color: 'green',
      });
      requestJoinRoom();
    };

    ws.onmessage = event => {
      let data: { type?: string; payload?: unknown };
      try {
        data = JSON.parse(event.data);
      } catch (error) {
        console.error('Failed to parse WS message', error);
        return;
      }

      const { type, payload } = data;

      switch (type) {
        case 'REQUEST_USER_INFO':
          requestJoinRoom();
          break;
        case 'USER_IDENTIFIED':
          break;
        case 'ROOM_LIST_UPDATED':
          if (!hasJoinedRoomRef.current && Array.isArray(payload)) {
            const hasRoom = payload.some(
              (room: { id?: string | number }) => String(room.id) === session.id
            );
            if (hasRoom) {
              requestJoinRoom();
            }
          }
          break;
        case 'ROOM_JOINED': {
          if (!isRecord(payload) || String(payload.id) !== session.id) break;
          hasJoinedRoomRef.current = true;
          roomMissingNotifiedRef.current = false;

          const mappedUsers = Array.isArray(payload.users)
            ? payload.users
                .map(normalizeServerUser)
                .filter((user): user is ChatUser => Boolean(user))
            : [];
          setParticipants(dedupeUsers([...mappedUsers, userPayload]));

          const mappedMessages = Array.isArray(payload.messages)
            ? payload.messages
                .map(normalizeServerMessage)
                .filter((message): message is ChatMessage => Boolean(message))
            : [];
          mappedMessages.sort((a, b) => a.timestamp - b.timestamp);
          setMessages(mappedMessages);
          break;
        }
        case 'USER_JOINED': {
          if (!isRecord(payload) || String(payload.roomId) !== session.id) break;
          const user = normalizeServerUser(payload.user);
          if (!user) break;
          setParticipants(prev => dedupeUsers([...prev, user]));
          if (user.id !== chatUser.id) {
            notifications.show({
              title: 'Participant Joined',
              message: `${user.username} joined the session`,
              color: 'blue',
            });
          }
          break;
        }
        case 'USER_LEFT': {
          if (!isRecord(payload) || String(payload.roomId) !== session.id) break;
          const leavingId =
            'userId' in payload &&
            (typeof payload.userId === 'string' || typeof payload.userId === 'number')
              ? String(payload.userId)
              : '';
          if (!leavingId) break;
          setParticipants(prev => prev.filter(user => user.id !== leavingId));
          if (leavingId !== chatUser.id) {
            const username =
              'username' in payload && typeof payload.username === 'string'
                ? payload.username
                : null;
            notifications.show({
              title: 'Participant Left',
              message: username
                ? `${username} left the session`
                : 'A participant left the session',
              color: 'yellow',
            });
          } else {
            hasJoinedRoomRef.current = false;
          }
          break;
        }
        case 'NEW_MESSAGE': {
          if (!isRecord(payload) || String(payload.roomId) !== session.id) break;
          const message = normalizeServerMessage(payload);
          if (!message) break;
          setParticipants(prev => {
            if (prev.some(user => user.id === message.sender.id)) {
              return prev;
            }
            return dedupeUsers([...prev, message.sender]);
          });
          setMessages(prev => {
            if (prev.some(existing => existing.id === message.id)) {
              return prev;
            }
            return [...prev, message];
          });
          break;
        }
        case 'MESSAGE_DELETED': {
          if (!isRecord(payload) || String(payload.roomId) !== session.id) break;
          const messageId =
            'messageId' in payload &&
            (typeof payload.messageId === 'string' || typeof payload.messageId === 'number')
              ? String(payload.messageId)
              : '';
          if (!messageId) break;
          setMessages(prev => prev.filter(message => message.id !== messageId));
          break;
        }
        case 'USER_KICKED': {
          if (!isRecord(payload) || String(payload.roomId) !== session.id) break;
          const kickedId =
            'kickedUserId' in payload &&
            (typeof payload.kickedUserId === 'string' || typeof payload.kickedUserId === 'number')
              ? String(payload.kickedUserId)
              : '';
          if (!kickedId) break;
          setParticipants(prev => prev.filter(user => user.id !== kickedId));
          if (kickedId !== chatUser.id) {
            notifications.show({
              title: 'Participant Removed',
              message: `${'kickedUsername' in payload && typeof payload.kickedUsername === 'string'
                ? payload.kickedUsername
                : 'A participant'} was removed by the instructor`,
              color: 'yellow',
            });
          }
          break;
        }
        case 'YOU_WERE_KICKED': {
          if (isRecord(payload) && String(payload.roomId) === session.id) {
            hasJoinedRoomRef.current = false;
            setMessages([]);
            setParticipants(prev => prev.filter(user => user.id !== chatUser.id));
            notifications.show({
              title: 'Removed from Session',
              message:
                'reason' in payload && typeof payload.reason === 'string'
                  ? payload.reason
                  : 'You were removed from this session.',
              color: 'red',
            });
          }
          break;
        }
        case 'YOU_LEFT_ROOM': {
          if (!isRecord(payload) || String(payload.roomId) !== session.id) break;
          hasJoinedRoomRef.current = false;
          setParticipants(prev => prev.filter(user => user.id !== chatUser.id));
          notifications.show({
            title: 'Left Session',
            message: 'You left the session chat.',
            color: 'yellow',
          });
          break;
        }
        case 'SERVER_SHUTDOWN':
          notifications.show({
            title: 'Server Shutdown',
            message: 'The chat server is shutting down. Connection closed.',
            color: 'red',
          });
          ws.close();
          break;
        case 'ERROR': {
          const message =
            isRecord(payload) && typeof payload.message === 'string'
              ? payload.message
              : 'An unknown error occurred.';
          const isRoomMissing = message === 'Room not found.';
          if (!roomMissingNotifiedRef.current || !isRoomMissing) {
            notifications.show({
              title: 'Chat Error',
              message,
              color: 'red',
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
      hasJoinedRoomRef.current = false;
      notifications.show({
        title: 'Disconnected',
        message: 'Lost connection to live session',
        color: 'red',
      });
    };

    ws.onerror = error => {
      console.error('WebSocket error:', error);
      notifications.show({
        title: 'Connection Error',
        message: 'Failed to connect to live session',
        color: 'red',
      });
    };

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = () => {
    const ws = wsRef.current;
    if (!messageInput.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(
      JSON.stringify({
        type: 'SEND_MESSAGE',
        payload: {
          roomId: session.id,
          text: messageInput.trim(),
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

    // Check if student is already enrolled in the session (for auto-created sessions from queue)
    const isEnrolled = session.students?.some(
      (student: User) => student.id === currentUser.id
    );

    if (isEnrolled) return true;

    // Check if student has an accepted session request (for regular session requests)
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
                      messages.map(message => {
                        const isSelf = message.sender.id === chatUser.id;
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
                            <Avatar size="sm" radius="xl">
                              {getInitials(message.sender.username)}
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
                                  {message.sender.username}
                                </Text>
                                <Text size="xs" style={{ opacity: 0.7 }}>
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </Text>
                                {message.sender.type === 'instructor' && (
                                  <Badge size="xs" color={isSelf ? 'teal' : 'blue'} variant="light">
                                    Instructor
                                  </Badge>
                                )}
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
                        participants.map(participant => (
                          <Group key={participant.id} gap="xs" wrap="nowrap">
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

                            {(participant.type === 'instructor' ||
                              participant.id === session.instructorId) && (
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
