'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import { IconMessage, IconVideo, IconUsers, IconClock, IconMapPin, IconUser, IconSend, IconX } from '@tabler/icons-react';
import PageWrapper from '@/components/PageWrapper';
import { Session, User, SessionRequest } from '@/lib/types';
import { getToken } from '@/actions/authentication';
import { useAuth } from '@/components/AuthProvider';
import { routes } from '@/app/routes';
import { ZoomEmbed } from '@/components/ZoomEmbed';
import { useZoomSDK } from '@/hooks/useZoomSDK';

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
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Zoom SDK hook
  const { config: zoomConfig, loading: zoomLoading, error: zoomError, fetchSDKSignature } = useZoomSDK();

  // Fetch Zoom SDK signature when session loads
  useEffect(() => {
    if (session.id && session.zoomLink) {
      const userName = `${currentUser.firstName} ${currentUser.lastName}`;
      const role = currentUser.id === session.instructorId ? 'host' : 'participant';
      fetchSDKSignature(
        0, // queueId not needed
        userName,
        currentUser.email,
        role,
        session.id // Use sessionId
      ).catch(err => {
        console.error('Failed to fetch Zoom SDK signature:', err);
      });
    }
  }, [session.id, session.zoomLink, currentUser.id, currentUser.firstName, currentUser.lastName, currentUser.email, fetchSDKSignature]);

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001';
      const ws = new WebSocket(`${wsUrl}?sessionId=${session.id}&userId=${currentUser.id}&userType=${currentUser.role.toLowerCase()}`);
      
      ws.onopen = () => {
        setIsConnected(true);
        notifications.show({
          title: 'Connected',
          message: 'Connected to live session',
          color: 'green',
        });
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'message':
            setMessages(prev => [...prev, data.message]);
            break;
          case 'participant_joined':
            setParticipants(prev => [...prev, data.user]);
            notifications.show({
              title: 'Participant Joined',
              message: `${data.user.firstName} ${data.user.lastName} joined the session`,
              color: 'blue',
            });
            break;
          case 'participant_left':
            setParticipants(prev => prev.filter(p => p.id !== data.userId));
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

      setWsConnection(ws);
    };

    if (session.id && currentUser.id) {
      connectWebSocket();
    }

    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [session.id, currentUser.id, currentUser.role]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = () => {
    if (!messageInput.trim() || !wsConnection || wsConnection.readyState !== WebSocket.OPEN) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: currentUser,
      text: messageInput.trim(),
      timestamp: new Date().toISOString(),
      type: 'message',
    };

    wsConnection.send(JSON.stringify({
      type: 'send_message',
      message: {
        sessionId: session.id,
        text: message.text,
        senderId: currentUser.id,
      },
    }));

    setMessageInput('');
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
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
              <Stack align="center" spacing="md">
                <IconX size={48} color="red" />
                <Title order={2}>Access Denied</Title>
                <Text color="dimmed" align="center">
                  You don't have permission to join this session. 
                  Please request to join the session first.
                </Text>
                <Button 
                  variant="outline" 
                  onClick={() => window.history.back()}
                >
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
              <Stack spacing="xs">
                <Title order={1}>{session.name}</Title>
                <Text color="dimmed">{session.description}</Text>
                <Group spacing="lg">
                  <Badge 
                    color={session.status === 'IN_PROGRESS' ? 'green' : 'blue'}
                    variant="light"
                  >
                    {session.status || 'SCHEDULED'}
                  </Badge>
                  {session.startTime && (
                    <Group spacing="xs">
                      <IconClock size={16} />
                      <Text size="sm">
                        {new Date(session.startTime).toLocaleString()}
                      </Text>
                    </Group>
                  )}
                  {session.maxAttendees && (
                    <Group spacing="xs">
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
              <Stack align="flex-end" spacing="md">
                <Button
                  leftIcon={<IconVideo size={16} />}
                  onClick={() => setShowZoomModal(true)}
                  color="blue"
                  size="lg"
                  fullWidth
                >
                  Join Zoom Meeting
                </Button>
                <Badge 
                  color={isConnected ? 'green' : 'red'}
                  variant="light"
                  size="lg"
                >
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Main Content */}
        <Grid>
          {/* Zoom Embed Section */}
          {session.zoomLink && (
            <Grid.Col span={12} mb="lg">
              <Paper p="xl" radius="md">
                <Stack spacing="md">
                  <Title order={3}>Zoom Meeting</Title>
                  {zoomConfig ? (
                    <ZoomEmbed
                      config={zoomConfig}
                      onError={(error) => {
                        console.error('Zoom embed error:', error);
                        notifications.show({
                          title: 'Zoom Error',
                          message: error,
                          color: 'red',
                        });
                      }}
                    />
                  ) : zoomLoading ? (
                    <Center h={400}>
                      <Loader size="lg" />
                      <Text ml="md">Loading Zoom meeting...</Text>
                    </Center>
                  ) : zoomError ? (
                    <Alert color="red" icon={<IconX size={16} />}>
                      Failed to load Zoom meeting: {zoomError}
                    </Alert>
                  ) : null}
                </Stack>
              </Paper>
            </Grid.Col>
          )}

          {/* Chat Section */}
          <Grid.Col span={session.zoomLink ? 6 : 8}>
            <Paper p="xl" radius="md" h={600}>
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
                        <Text color="dimmed">No messages yet. Start the conversation!</Text>
                      </Center>
                    ) : (
                      messages.map((message) => (
                        <Box
                          key={message.id}
                          sx={{
                            display: 'flex',
                            flexDirection: message.sender.id === currentUser.id ? 'row-reverse' : 'row',
                            alignItems: 'flex-start',
                            gap: 'xs',
                          }}
                        >
                          <Avatar
                            size="sm"
                            src={message.sender.profilePicture}
                            radius="xl"
                          >
                            {message.sender.firstName[0]}{message.sender.lastName[0]}
                          </Avatar>
                          <Box
                            sx={{
                              maxWidth: '70%',
                              backgroundColor: message.sender.id === currentUser.id 
                                ? 'var(--mantine-color-blue-6)' 
                                : 'var(--mantine-color-gray-2)',
                              color: message.sender.id === currentUser.id ? 'white' : 'inherit',
                              padding: 'xs',
                              borderRadius: 'md',
                            }}
                          >
                            <Group spacing="xs" mb={4}>
                              <Text size="sm" weight={500}>
                                {message.sender.firstName} {message.sender.lastName}
                              </Text>
                              <Text size="xs" opacity={0.7}>
                                {new Date(message.timestamp).toLocaleTimeString()}
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
            </Paper>
          </Grid.Col>

          {/* Participants & Session Info */}
          <Grid.Col span={session.zoomLink ? 6 : 4}>
            <Stack spacing="md">
              {/* Participants */}
              <Paper p="xl" radius="md">
                <Stack spacing="md">
                  <Title order={4} leftIcon={<IconUsers size={18} />}>
                    Participants
                  </Title>
                  <ScrollArea h={200}>
                    <Stack spacing="xs">
                      {participants.length === 0 ? (
                        <Text size="sm" color="dimmed" align="center">
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
                              {participant.firstName[0]}{participant.lastName[0]}
                            </Avatar>
                            <Box style={{ flex: 1 }}>
                              <Text size="sm" weight={500}>
                                {participant.firstName} {participant.lastName}
                              </Text>
                              <Text size="xs" color="dimmed">
                                {participant.role}
                              </Text>
                            </Box>
                            {participant.id === session.instructorId && (
                              <Badge size="xs" color="blue">Instructor</Badge>
                            )}
                          </Group>
                        ))
                      )}
                    </Stack>
                  </ScrollArea>
                </Stack>
              </Paper>

              {/* Session Materials */}
              {session.materials && session.materials.length > 0 && (
                <Paper p="xl" radius="md">
                  <Stack spacing="md">
                    <Title order={4}>Session Materials</Title>
                    <Stack spacing="xs">
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
              {session.objectives && session.objectives.length > 0 && (
                <Paper p="xl" radius="md">
                  <Stack spacing="md">
                    <Title order={4}>Learning Objectives</Title>
                    <Stack spacing="xs">
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
          <Stack spacing="md">
            {session.zoomLink ? (
              <>
                <Text>
                  Click the button below to join the Zoom meeting for this session.
                </Text>
                <Button
                  leftIcon={<IconVideo size={16} />}
                  onClick={joinZoomMeeting}
                  color="blue"
                  size="lg"
                  fullWidth
                >
                  Open Zoom Meeting
                </Button>
                <Text size="sm" color="dimmed">
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
  const params = useParams();
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

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${params.id}`,
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
        setSession(data.session);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchSession();
    }
  }, [params.id, router]);

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
              <Stack align="center" spacing="md">
                <IconX size={48} color="red" />
                <Title order={2}>Error</Title>
                <Text color="dimmed" align="center">
                  {error || 'Session not found'}
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
