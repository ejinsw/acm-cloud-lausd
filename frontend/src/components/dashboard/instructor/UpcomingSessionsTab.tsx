import { Title, Grid, Card, Text, Group, Badge, Button, Box } from "@mantine/core";
import { Calendar, Clock, Users, Video, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Session } from "@/lib/types";

interface UpcomingSessionsTabProps {
  sessions: Session[];
}

export function UpcomingSessionsTab({ sessions }: UpcomingSessionsTabProps) {
  // Filter for upcoming sessions (SCHEDULED or IN_PROGRESS)
  const upcomingSessions = sessions.filter(session => 
    session.status === 'SCHEDULED' || session.status === 'IN_PROGRESS'
  );

  if (upcomingSessions.length === 0) {
    return (
      <Box>
        <Title order={4} mb="md">Upcoming Sessions</Title>
        <Text c="dimmed" ta="center" py="xl">
          No upcoming sessions scheduled. 
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
      </Box>
    );
  }

  return (
    <Box>
      <Title order={4} mb="md">Upcoming Sessions</Title>
      <Grid>
        {upcomingSessions.map((session) => (
          <Grid.Col key={session.id} span={{ base: 12, sm: 6, md: 4 }}>
            <Card withBorder radius="md" p="md">
              <Group justify="space-between" mb="xs">
                <Text fw={500} lineClamp={1}>{session.name}</Text>
                <Badge color={session.status === 'IN_PROGRESS' ? 'green' : 'blue'}>
                  {session.status === 'IN_PROGRESS' ? 'In Progress' : 'Scheduled'}
                </Badge>
              </Group>
              
              {session.description && (
                <Text size="sm" c="dimmed" mb="md" lineClamp={2}>
                  {session.description}
                </Text>
              )}
              
              {session.startTime && (
                <Text size="sm" c="dimmed" mb="md">
                  <Calendar size={14} style={{ display: "inline", marginRight: 5 }} />
                  {new Date(session.startTime).toLocaleDateString()}
                </Text>
              )}
              
              {session.startTime && session.endTime && (
                <Text size="sm" c="dimmed" mb="md">
                  <Clock size={14} style={{ display: "inline", marginRight: 5 }} />
                  {new Date(session.startTime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} - {new Date(session.endTime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              )}
              
              <Group justify="space-between">
                <Badge leftSection={<Users size={12} />}>
                  {session.students?.length || 0} students
                </Badge>
                <Group>
                  <Button 
                    component={Link} 
                    href={`/sessions/${session.id}`} 
                    variant="subtle" 
                    size="xs" 
                    rightSection={<ArrowUpRight size={14} />}
                  >
                    Details
                  </Button>
                  {session.status === 'SCHEDULED' && (
                    <Button
                      variant="light"
                      size="xs"
                      color="blue"
                      leftSection={<Video size={14} />}
                    >
                      Start
                    </Button>
                  )}
                </Group>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Box>
  );
}
