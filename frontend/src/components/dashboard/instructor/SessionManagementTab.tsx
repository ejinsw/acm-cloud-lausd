import { useState } from "react";
import { Title, Grid, Card, Text, Group, Badge, Button, Box, Tabs, ActionIcon, Menu, Modal, Paper } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Eye, Edit, Trash, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Session } from "@/lib/types";

interface SessionManagementTabProps {
  sessions: Session[];
  onSessionUpdate: () => void;
}

export function SessionManagementTab({ sessions, onSessionUpdate }: SessionManagementTabProps) {
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

  // Filter sessions by status
  const activeSessions = sessions.filter((session) => 
    session.status === 'SCHEDULED' || session.status === 'IN_PROGRESS'
  );
  const completedSessions = sessions.filter((session) => 
    session.status === 'COMPLETED'
  );
  const cancelledSessions = sessions.filter((session) => 
    session.status === 'CANCELLED'
  );

  const handleDelete = (session: Session) => {
    setSessionToDelete(session);
    openDeleteModal();
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;

    try {
      // In a real app, you would call an API to delete the session
      console.log(`Deleting session with ID: ${sessionToDelete.id}`);
      
      // Refresh the sessions list
      onSessionUpdate();
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const renderSessionCard = (session: Session) => (
    <Grid.Col key={session.id} span={{ base: 12, md: 6, lg: 4 }}>
      <Card withBorder radius="md" p="md">
        <Group justify="space-between" mb="xs">
          <Text fw={500} lineClamp={1}>{session.name}</Text>
          <Group gap="xs">
            <StatusBadge status={session.status || 'SCHEDULED'} />
            <Menu position="bottom-end" shadow="md">
              <Menu.Target>
                <ActionIcon variant="subtle">
                  <MoreHorizontal size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item 
                  leftSection={<Eye size={14} />}
                  component={Link}
                  href={`/sessions/${session.id}`}
                >
                  View Details
                </Menu.Item>
                <Menu.Item 
                  leftSection={<Edit size={14} />}
                  component={Link}
                  href={`/sessions/edit/${session.id}`}
                >
                  Edit Session
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item 
                  leftSection={<Trash size={14} />}
                  color="red"
                  onClick={() => handleDelete(session)}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
        
        {session.description && (
          <Text size="sm" c="dimmed" mb="md" lineClamp={2}>
            {session.description}
          </Text>
        )}
        
        {session.subjects && session.subjects.length > 0 && (
          <Group mb="xs">
            {session.subjects.map((subject) => (
              <Badge key={subject.id} color="blue">{subject.name}</Badge>
            ))}
          </Group>
        )}
        
        <Group mb="xs" justify="space-between">
          <Group gap="xs">
            <Text size="sm" c="dimmed">Students:</Text>
            <Text size="sm">{session.students?.length || 0}</Text>
          </Group>
          {session.maxAttendees && (
            <Group gap="xs">
              <Text size="sm" c="dimmed">Max:</Text>
              <Text size="sm">{session.maxAttendees}</Text>
            </Group>
          )}
        </Group>
        
        {session.startTime && (
          <Text size="sm" c="dimmed" mb="md">
            {new Date(session.startTime).toLocaleDateString()}
          </Text>
        )}
        
        {session.status === 'SCHEDULED' && (
          <Group mt="md" justify="flex-end">
            <Button variant="light" size="xs" component={Link} href={`/sessions/${session.id}`}>
              Manage
            </Button>
          </Group>
        )}
        
        {session.status === 'IN_PROGRESS' && (
          <Group mt="md" justify="flex-end">
            <Button variant="filled" size="xs" color="green">
              Continue
            </Button>
          </Group>
        )}
      </Card>
    </Grid.Col>
  );

  return (
    <Box>
      <Title order={3} mb="md">Session Management</Title>
      
      <Tabs defaultValue="active">
        <Tabs.List mb="md">
          <Tabs.Tab 
            value="active" 
            rightSection={<Badge size="xs">{activeSessions.length}</Badge>}
          >
            Active
          </Tabs.Tab>
          <Tabs.Tab 
            value="completed" 
            rightSection={<Badge size="xs">{completedSessions.length}</Badge>}
          >
            Completed
          </Tabs.Tab>
          <Tabs.Tab 
            value="cancelled" 
            rightSection={<Badge size="xs">{cancelledSessions.length}</Badge>}
          >
            Cancelled
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="active">
          <Grid>
            {activeSessions.length > 0 ? (
              activeSessions.map(renderSessionCard)
            ) : (
              <Grid.Col span={12}>
                <Paper p="xl" ta="center">
                  <Text c="dimmed">No active sessions. 
                    <Button 
                      component={Link} 
                      href="/sessions/create" 
                      variant="subtle" 
                      size="sm" 
                      ml="xs"
                    >
                      Create your first session
                    </Button>
                  </Text>
                </Paper>
              </Grid.Col>
            )}
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="completed">
          <Grid>
            {completedSessions.length > 0 ? (
              completedSessions.map(renderSessionCard)
            ) : (
              <Grid.Col span={12}>
                <Paper p="xl" ta="center">
                  <Text c="dimmed">No completed sessions yet.</Text>
                </Paper>
              </Grid.Col>
            )}
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="cancelled">
          <Grid>
            {cancelledSessions.length > 0 ? (
              cancelledSessions.map(renderSessionCard)
            ) : (
              <Grid.Col span={12}>
                <Paper p="xl" ta="center">
                  <Text c="dimmed">No cancelled sessions.</Text>
                </Paper>
              </Grid.Col>
            )}
          </Grid>
        </Tabs.Panel>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Modal 
        opened={deleteModalOpened} 
        onClose={closeDeleteModal}
        title="Delete Session"
        centered
      >
        <Text mb="lg">
          Are you sure you want to delete &quot;{sessionToDelete?.name}&quot;? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="outline" onClick={closeDeleteModal}>Cancel</Button>
          <Button color="red" onClick={confirmDelete}>Delete</Button>
        </Group>
      </Modal>
    </Box>
  );
}

function StatusBadge({ status }: { status: string }) {
  let color;
  let label;

  switch (status) {
    case "SCHEDULED":
      color = "blue";
      label = "Scheduled";
      break;
    case "IN_PROGRESS":
      color = "green";
      label = "In Progress";
      break;
    case "COMPLETED":
      color = "gray";
      label = "Completed";
      break;
    case "CANCELLED":
      color = "red";
      label = "Cancelled";
      break;
    default:
      color = "blue";
      label = status;
  }

  return <Badge color={color}>{label}</Badge>;
}
