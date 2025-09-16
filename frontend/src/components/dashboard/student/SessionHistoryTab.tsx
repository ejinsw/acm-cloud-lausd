import { Grid, Card, Group, Text, Badge, Button, Rating, Stack } from "@mantine/core";
import { Calendar, Star, Clock, User } from "lucide-react";
import { SessionHistoryItem } from "@/lib/types";

export interface PastSession extends SessionHistoryItem {
  userRating?: number | null;
  userReview?: string | null;
}

interface SessionHistoryTabProps {
  sessionHistory: SessionHistoryItem[];
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

export function SessionHistoryTab({ sessionHistory, onReviewClick }: SessionHistoryTabProps) {
  
  if (sessionHistory.length === 0) {
    return (
      <Card withBorder shadow="sm" p="xl" ta="center">
        <Text size="lg" fw={500} mb="md">No session history yet</Text>
        <Text size="sm" c="dimmed">Your session history will appear here</Text>
      </Card>
    );
  }

  return (
    <Grid>
      {sessionHistory.map((session) => {
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
                {session.instructorName && (
                  <Group gap="xs">
                    <User size={14} />
                    <Text size="sm">
                      {session.instructorName}
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
              
              {session.relatedReview ? (
                <Stack gap="xs" mb="md">
                  <Group gap="xs">
                    <Rating value={session.relatedReview.rating} readOnly size="sm" />
                    <Text size="sm" fw={500}>{session.relatedReview.rating}/5 - Your Review</Text>
                  </Group>
                  {session.relatedReview.comment && (
                    <Text size="xs" c="dimmed" lineClamp={2} style={{ fontStyle: 'italic' }}>
                      "{session.relatedReview.comment}"
                    </Text>
                  )}
                </Stack>
              ) : (
                <Button 
                  variant="light" 
                  size="xs" 
                  onClick={() => onReviewClick(session as PastSession)}
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