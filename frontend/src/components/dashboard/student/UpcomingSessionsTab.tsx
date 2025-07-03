import { Grid, Card, Group, Avatar, Text, Badge, Button } from "@mantine/core";
import { Calendar, Video, BookOpen } from "lucide-react";
import Link from "next/link";
import { routes } from "@/app/routes";

interface Instructor {
  id: number;
  name: string;
  avatar: string;
  rating: number;
}

interface Session {
  id: number;
  title: string;
  date: string;
  duration: number;
  instructor: Instructor;
  subject: string;
  status: string;
  joinUrl: string;
}

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

// Check if a session is happening now
function isSessionNow(dateString: string, durationMinutes: number) {
  const sessionTime = new Date(dateString).getTime();
  const now = new Date().getTime();
  const endTime = sessionTime + (durationMinutes * 60 * 1000);
  
  return now >= sessionTime && now <= endTime;
}

// Determine status badge color
function getStatusColor(status: string) {
  switch(status) {
    case 'confirmed': return 'green';
    case 'pending': return 'yellow';
    case 'completed': return 'blue';
    case 'cancelled': return 'red';
    default: return 'gray';
  }
}

export function UpcomingSessionsTab({ sessions }: UpcomingSessionsTabProps) {
  return (
    <Grid>
      {sessions.length === 0 ? (
        <Grid.Col span={12}>
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
        </Grid.Col>
      ) : (
        sessions.map((session) => (
          <Grid.Col key={session.id} span={{ base: 12, md: 6 }}>
            <Card withBorder radius="md" p="md">
              <Group justify="space-between" mb="xs">
                <Text fw={500}>{session.title}</Text>
                <Badge color={getStatusColor(session.status)}>
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </Badge>
              </Group>
              <Group mb="xs">
                <Avatar src={session.instructor.avatar} size="sm" radius="xl" />
                <Text size="sm">{session.instructor.name}</Text>
              </Group>
              <Text size="sm" c="dimmed" mb="md">
                <Calendar size={14} style={{ display: "inline", marginRight: 5 }} />
                {formatSessionDate(session.date)}
              </Text>
              <Group justify="space-between">
                <Button 
                  component={Link} 
                  href={routes.sessionDetails(session.id.toString())} 
                  variant="light" 
                  size="xs"
                >
                  View Details
                </Button>
                {isSessionNow(session.date, session.duration) && (
                  <Button 
                    component={Link} 
                    href={session.joinUrl} 
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
        ))
      )}
    </Grid>
  );
} 