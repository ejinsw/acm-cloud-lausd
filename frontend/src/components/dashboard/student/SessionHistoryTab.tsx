import { Grid, Card, Group, Avatar, Text, Badge, Button, Rating } from "@mantine/core";
import { Calendar, Star } from "lucide-react";

interface Instructor {
  id: number;
  name: string;
  avatar: string;
  rating: number;
}

export interface PastSession {
  id: number;
  title: string;
  date: string;
  duration: number;
  instructor: Instructor;
  subject: string;
  status: string;
  userRating: number | null;
  userReview: string | null;
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

export function SessionHistoryTab({ sessions, onReviewClick }: SessionHistoryTabProps) {
  return (
    <Grid>
      {sessions.map((session) => (
        <Grid.Col key={session.id} span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" p="md">
            <Group justify="space-between" mb="xs">
              <Text fw={500}>{session.title}</Text>
              <Badge color="blue">Completed</Badge>
            </Group>
            <Group mb="xs">
              <Avatar src={session.instructor.avatar} size="sm" radius="xl" />
              <Text size="sm">{session.instructor.name}</Text>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              <Calendar size={14} style={{ display: "inline", marginRight: 5 }} />
              {formatSessionDate(session.date)}
            </Text>
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
      ))}
    </Grid>
  );
} 