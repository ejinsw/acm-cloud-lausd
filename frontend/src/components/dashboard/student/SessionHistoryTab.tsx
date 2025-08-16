import { Grid, Card, Group, Text, Badge, Button, Rating, Stack } from "@mantine/core";
import { Calendar, Star, Clock, User } from "lucide-react";
import { Session } from "@/lib/types";

export interface PastSession extends Session {
  userRating?: number | null;
  userReview?: string | null;
}

interface SessionHistoryTabProps {
  sessions: PastSession[];
  onReviewClick: (session: PastSession) => void;
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

export function SessionHistoryTab({ sessions, onReviewClick }: SessionHistoryTabProps) {
  // Filter for completed sessions
  const completedSessions = sessions.filter(session => 
    session.status === 'COMPLETED'
  );

  if (completedSessions.length === 0) {
    return (
      <Card withBorder shadow="sm" p="xl" ta="center">
        <Text size="lg" fw={500} mb="md">No completed sessions yet</Text>
        <Text size="sm" c="dimmed">Your completed sessions will appear here</Text>
      </Card>
    );
  }

  return (
    <Grid>
      {completedSessions.map((session) => {
        const duration = session.startTime && session.endTime 
          ? getSessionDuration(session.startTime, session.endTime)
          : 0;

        return (
          <Grid.Col key={session.id} span={{ base: 12, md: 6 }}>
            <Card withBorder radius="md" p="md">
              <Group justify="space-between" mb="xs">
                <Text fw={500} size="lg">{session.name}</Text>
                <Badge color="blue">Completed</Badge>
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
              
              {session.userRating ? (
                <Group gap="xs" mb="md">
                  <Rating value={session.userRating} readOnly size="sm" />
                  <Text size="sm">{session.userRating}/5</Text>
                </Group>
              ) : (
                <Button 
                  variant="light" 
                  size="xs" 
                  onClick={() => onReviewClick(session)}
                  leftSection={<Star size={14} />}
                >
                  Leave Review
                </Button>
              )}
            </Card>
          </Grid.Col>
        );
      })}
    </Grid>
  );
} 