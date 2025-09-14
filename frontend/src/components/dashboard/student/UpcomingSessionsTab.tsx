import { Grid, Card, Group, Text, Badge, Button, Stack } from "@mantine/core";
import { Calendar, Video, BookOpen, Clock, User } from "lucide-react";
import Link from "next/link";
import { routes } from "@/app/routes";
import { Session } from "@/lib/types";

interface UpcomingSessionsTabProps {
  sessions: Session[];
}

// Format date for display
function formatSessionDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Calculate session duration
function getSessionDuration(startTime: string, endTime: string): number {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.round((end - start) / (1000 * 60)); // Duration in minutes
}

// Check if a session is happening now
function isSessionNow(startTime: string, endTime: string) {
  const now = new Date().getTime();
  const sessionStart = new Date(startTime).getTime();
  const sessionEnd = new Date(endTime).getTime();
  
  return now >= sessionStart && now <= sessionEnd;
}

// Determine status badge color
function getStatusColor(status: string) {
  switch(status) {
    case 'SCHEDULED': return 'blue';
    case 'IN_PROGRESS': return 'green';
    case 'COMPLETED': return 'gray';
    case 'CANCELLED': return 'red';
    default: return 'gray';
  }
}

export function UpcomingSessionsTab({ sessions }: UpcomingSessionsTabProps) {
  // Filter for upcoming sessions (scheduled or in progress)
  const upcomingSessions = sessions.filter(session => 
    session.status === 'SCHEDULED' || session.status === 'IN_PROGRESS'
  );

  if (upcomingSessions.length === 0) {
    return (
      <Card withBorder shadow="sm" p="xl" ta="center">
        <Text size="lg" fw={500} mb="md">You don&apos;t have any upcoming sessions</Text>
        <Button 
          component={Link} 
          href={routes.exploreSessions}
          leftSection={<BookOpen size={16} />}
        >
          Explore Sessions
        </Button>
      </Card>
    );
  }

  return (
    <Grid>
      {upcomingSessions.map((session) => {
        const duration = session.startTime && session.endTime 
          ? getSessionDuration(session.startTime, session.endTime)
          : 0;
        const isNow = session.startTime && session.endTime 
          ? isSessionNow(session.startTime, session.endTime)
          : false;

        return (
          <Grid.Col key={session.id} span={{ base: 12, md: 6 }}>
            <Card withBorder radius="md" p="md">
              <Group justify="space-between" mb="xs">
                <Text fw={500} size="lg">{session.name}</Text>
                <Badge color={getStatusColor(session.status || 'SCHEDULED')}>
                  {session.status?.replace('_', ' ') || 'SCHEDULED'}
                </Badge>
              </Group>
              
              <Stack gap="xs" mb="md">
                {session.instructor && (
                  <Group gap="xs">
                    <User size={14} />
                    <Text size="sm">
                      {session.instructor.firstName} {session.instructor.lastName}
                    </Text>
                  </Group>
                )}
                
                {session.startTime && (
                  <Group gap="xs">
                    <Calendar size={14} />
                    <Text size="sm">
                      {formatSessionDate(session.startTime)}
                    </Text>
                  </Group>
                )}
                
                {duration > 0 && (
                  <Group gap="xs">
                    <Clock size={14} />
                    <Text size="sm">{duration} minutes</Text>
                  </Group>
                )}
                
                {session.description && (
                  <Text size="sm" c="dimmed" lineClamp={2}>
                    {session.description}
                  </Text>
                )}
              </Stack>
              
              <Group justify="space-between">
                <Button 
                  component={Link} 
                  href={routes.sessionDetails(session.id)} 
                  variant="light" 
                  size="xs"
                >
                  View Details
                </Button>
                
                {isNow && session.zoomLink && (
                  <Button 
                    component="a" 
                    href={session.zoomLink} 
                    target="_blank"
                    variant="filled" 
                    size="xs"
                    leftSection={<Video size={14} />}
                  >
                    Join Now
                  </Button>
                )}
              </Group>
            </Card>
          </Grid.Col>
        );
      })}
    </Grid>
  );
} 