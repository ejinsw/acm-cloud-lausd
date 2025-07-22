import { Grid, Title, Card, Group, Text, Avatar, Progress, Button, Badge } from "@mantine/core";
import Link from "next/link";
import { Calendar, ArrowUpRight } from "lucide-react";
import { routes } from "@/app/routes";

export type SessionStatus = "in-progress" | "not-started" | "completed";

export interface Session {
  id: string;
  title: string;
  instructor: {
    name: string;
    avatar: string;
    rating: number;
  };
  subject: string;
  level: string;
  completedLessons: number;
  totalLessons: number;
  nextSession: string;
  status: SessionStatus;
}

interface UpcomingSessionsProps {
  sessions: Session[];
}

function StatusBadge({ status }: { status: SessionStatus }) {
  let color;
  let label;

  switch (status) {
    case "in-progress":
      color = "blue";
      label = "In Progress";
      break;
    case "not-started":
      color = "gray";
      label = "Not Started";
      break;
    case "completed":
      color = "green";
      label = "Completed";
      break;
    default:
      color = "blue";
      label = status;
  }

  return <Badge color={color}>{label}</Badge>;
}

export function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  return (
    <>
      <Title order={4} mb="md">Upcoming Sessions</Title>
      <Grid mb="xl">
        {sessions.slice(0, 2).map((session) => (
          <Grid.Col key={session.id} span={{ base: 12, md: 6 }}>
            <Card withBorder radius="md" p="md">
              <Group justify="space-between" mb="xs">
                <Text fw={500}>{session.title}</Text>
                <StatusBadge status={session.status} />
              </Group>
              <Group mb="xs">
                <Avatar src={session.instructor.avatar} size="sm" radius="xl" />
                <Text size="sm">{session.instructor.name}</Text>
              </Group>
              <Text size="sm" c="dimmed" mb="md">
                <Calendar size={14} style={{ display: "inline", marginRight: 5 }} />
                Next: {session.nextSession}
              </Text>
              <Progress 
                value={(session.completedLessons / session.totalLessons) * 100} 
                size="sm" 
                radius="xs" 
                mb="xs"
              />
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {session.completedLessons} of {session.totalLessons} lessons completed
                </Text>
                <Button 
                  component={Link} 
                  href={routes.sessionDetails(session.id)} 
                  variant="light" 
                  size="xs" 
                  rightSection={<ArrowUpRight size={14} />}
                >
                  Details
                </Button>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </>
  );
} 