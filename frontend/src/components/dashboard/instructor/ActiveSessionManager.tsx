import { useState, useEffect } from "react";
import {
  Title,
  Paper,
  Grid,
  Card,
  Text,
  Group,
  Button,
  Badge,
  Avatar,
  Stack,
  Modal,
  Textarea,
  Box,
  Alert,
  Loader,
  Tabs,
  Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { 
  Play, 
  Square, 
  Clock, 
  Users, 
  BookOpen, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar
} from "lucide-react";
import { getToken } from "@/actions/authentication";
import { Session } from "@/lib/types";

interface ActiveSessionManagerProps {
  sessions: Session[];
  onSessionUpdate: () => void;
}

interface SessionWithDetails extends Session {
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    averageRating?: number;
  };
  students: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  }[];
  subjects: {
    id: string;
    name: string;
    description?: string;
  }[];
}

export function ActiveSessionManager({ sessions, onSessionUpdate }: ActiveSessionManagerProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionWithDetails | null>(null);
  const [sessionNotes, setSessionNotes] = useState("");
  
  const [notesModalOpened, { open: openNotesModal, close: closeNotesModal }] = useDisclosure(false);

  // Filter sessions by status
  const scheduledSessions = sessions.filter(session => session.status === 'SCHEDULED');
  const inProgressSessions = sessions.filter(session => session.status === 'IN_PROGRESS');
  const completedSessions = sessions.filter(session => session.status === 'COMPLETED');

  const handleStartSession = async (sessionId: string) => {
    setIsUpdating(sessionId);
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${sessionId}/start`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to start session');
      }

      notifications.show({
        title: "Session Started",
        message: "Session has been started successfully.",
        color: "green",
      });

      onSessionUpdate();
    } catch (error) {
      console.error('Error starting session:', error);
      notifications.show({
        title: "Error",
        message: "Failed to start session. Please try again.",
        color: "red",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleStopSession = async (sessionId: string) => {
    setIsUpdating(sessionId);
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${sessionId}/stop`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes: sessionNotes }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to stop session');
      }

      notifications.show({
        title: "Session Completed",
        message: "Session has been completed successfully.",
        color: "green",
      });

      setSessionNotes("");
      closeNotesModal();
      onSessionUpdate();
    } catch (error) {
      console.error('Error stopping session:', error);
      notifications.show({
        title: "Error",
        message: "Failed to complete session. Please try again.",
        color: "red",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleOpenNotesModal = (session: SessionWithDetails) => {
    setSelectedSession(session);
    setSessionNotes("");
    openNotesModal();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <Badge color="blue" leftSection={<Clock size={12} />}>Scheduled</Badge>;
      case 'IN_PROGRESS':
        return <Badge color="green" leftSection={<Play size={12} />}>In Progress</Badge>;
      case 'COMPLETED':
        return <Badge color="gray" leftSection={<CheckCircle size={12} />}>Completed</Badge>;
      case 'CANCELLED':
        return <Badge color="red" leftSection={<XCircle size={12} />}>Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return 'Duration not set';
    
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const isSessionReadyToStart = (session: SessionWithDetails) => {
    if (!session.startTime) return false;
    const now = new Date();
    const startTime = new Date(session.startTime);
    // Allow starting 15 minutes before scheduled time
    return now >= new Date(startTime.getTime() - 15 * 60 * 1000);
  };

  const canStartSession = (session: SessionWithDetails) => {
    return session.status === 'SCHEDULED' && isSessionReadyToStart(session);
  };

  const canStopSession = (session: SessionWithDetails) => {
    return session.status === 'IN_PROGRESS';
  };

  const renderSessionCard = (session: SessionWithDetails) => (
    <Card key={session.id} shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        {/* Session Header */}
        <Group justify="space-between" align="flex-start">
          <Box style={{ flex: 1 }}>
            <Text size="lg" fw={500} mb={4}>
              {session.name}
            </Text>
            {session.description && (
              <Text size="sm" c="dimmed" lineClamp={2}>
                {session.description}
              </Text>
            )}
          </Box>
          {getStatusBadge(session.status || 'SCHEDULED')}
        </Group>

        {/* Session Details */}
        <Stack gap="xs">
          <Group gap="xs">
            <Calendar size={16} />
            <Text size="sm">
              {formatDateTime(session.startTime)}
            </Text>
          </Group>
          
          <Group gap="xs">
            <Clock size={16} />
            <Text size="sm">
              Duration: {formatDuration(session.startTime, session.endTime)}
            </Text>
          </Group>

          <Group gap="xs">
            <Users size={16} />
            <Text size="sm">
              {session.students?.length || 0}/{session.maxAttendees || '∞'} students
            </Text>
          </Group>

          {session.subjects && session.subjects.length > 0 && (
            <Group gap="xs">
              <BookOpen size={16} />
              <Text size="sm">
                {session.subjects.map(subject => subject.name).join(', ')}
              </Text>
            </Group>
          )}
        </Stack>

        <Divider />

        {/* Students List */}
        {session.students && session.students.length > 0 && (
          <Box>
            <Text size="sm" fw={500} mb="xs">Students:</Text>
            <Stack gap="xs">
              {session.students.map((student) => (
                <Group key={student.id} gap="xs">
                  <Avatar size="xs" radius="xl">
                    {student.firstName[0]}{student.lastName[0]}
                  </Avatar>
                  <Text size="xs">
                    {student.firstName} {student.lastName}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Box>
        )}

        {/* Action Buttons */}
        <Group gap="xs">
          {canStartSession(session) && (
            <Button
              size="sm"
              color="green"
              leftSection={<Play size={14} />}
              onClick={() => handleStartSession(session.id)}
              loading={isUpdating === session.id}
              fullWidth
            >
              Start Session
            </Button>
          )}
          
          {canStopSession(session) && (
            <Button
              size="sm"
              color="red"
              leftSection={<Square size={14} />}
              onClick={() => handleOpenNotesModal(session)}
              loading={isUpdating === session.id}
              fullWidth
            >
              Complete Session
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  );

  return (
    <Box>
      <Title order={3} mb="md">Active Session Management</Title>
      
      <Tabs defaultValue="scheduled">
        <Tabs.List mb="md">
          <Tabs.Tab 
            value="scheduled" 
            rightSection={<Badge size="xs">{scheduledSessions.length}</Badge>}
          >
            Scheduled
          </Tabs.Tab>
          <Tabs.Tab 
            value="in-progress" 
            rightSection={<Badge size="xs">{inProgressSessions.length}</Badge>}
          >
            In Progress
          </Tabs.Tab>
          <Tabs.Tab 
            value="completed" 
            rightSection={<Badge size="xs">{completedSessions.length}</Badge>}
          >
            Completed
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="scheduled">
          {scheduledSessions.length > 0 ? (
            <Grid>
              {scheduledSessions.map((session) => (
                <Grid.Col key={session.id} span={{ base: 12, md: 6, lg: 4 }}>
                  {renderSessionCard(session)}
                </Grid.Col>
              ))}
            </Grid>
          ) : (
            <Paper p="xl" ta="center">
              <Text c="dimmed">No scheduled sessions.</Text>
            </Paper>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="in-progress">
          {inProgressSessions.length > 0 ? (
            <Grid>
              {inProgressSessions.map((session) => (
                <Grid.Col key={session.id} span={{ base: 12, md: 6, lg: 4 }}>
                  {renderSessionCard(session)}
                </Grid.Col>
              ))}
            </Grid>
          ) : (
            <Paper p="xl" ta="center">
              <Text c="dimmed">No sessions in progress.</Text>
            </Paper>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="completed">
          {completedSessions.length > 0 ? (
            <Grid>
              {completedSessions.map((session) => (
                <Grid.Col key={session.id} span={{ base: 12, md: 6, lg: 4 }}>
                  {renderSessionCard(session)}
                </Grid.Col>
              ))}
            </Grid>
          ) : (
            <Paper p="xl" ta="center">
              <Text c="dimmed">No completed sessions yet.</Text>
            </Paper>
          )}
        </Tabs.Panel>
      </Tabs>

      {/* Session Notes Modal */}
      <Modal
        opened={notesModalOpened}
        onClose={closeNotesModal}
        title="Complete Session"
        centered
      >
        <Stack>
          <Text size="sm">
            You are about to complete the session:{" "}
            <strong>{selectedSession?.name}</strong>
          </Text>
          
          <Text size="sm" c="dimmed">
            Optional: Add notes about the session (e.g., topics covered, student progress, etc.)
          </Text>
          
          <Textarea
            placeholder="Session notes (optional)"
            value={sessionNotes}
            onChange={(event) => setSessionNotes(event.currentTarget.value)}
            rows={4}
          />
          
          <Group justify="flex-end">
            <Button variant="outline" onClick={closeNotesModal}>
              Cancel
            </Button>
            <Button 
              color="red" 
              onClick={() => selectedSession && handleStopSession(selectedSession.id)}
            >
              Complete Session
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
