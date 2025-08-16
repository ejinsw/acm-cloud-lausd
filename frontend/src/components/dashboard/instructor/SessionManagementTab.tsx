import { useState } from "react";
import { Title, Grid, Text, Group, Button, Box, Tabs, Modal, Paper, Badge } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { Session } from "@/lib/types";
import { SessionCard } from "./SessionCard";

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
              activeSessions.map((session) => (
                <Grid.Col key={session.id} span={{ base: 12, md: 6, lg: 4 }}>
                  <SessionCard 
                    session={session} 
                    onDelete={handleDelete}
                  />
                </Grid.Col>
              ))
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
              completedSessions.map((session) => (
                <Grid.Col key={session.id} span={{ base: 12, md: 6, lg: 4 }}>
                  <SessionCard 
                    session={session} 
                    onDelete={handleDelete}
                  />
                </Grid.Col>
              ))
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
              cancelledSessions.map((session) => (
                <Grid.Col key={session.id} span={{ base: 12, md: 6, lg: 4 }}>
                  <SessionCard 
                    session={session} 
                    onDelete={handleDelete}
                  />
                </Grid.Col>
              ))
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
