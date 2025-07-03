import { Card, Text, Group, Avatar, Badge, Button, Progress } from "@mantine/core";
import { Calendar, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { routes } from "@/app/routes";

interface SessionCardProps {
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
  status: "in-progress" | "not-started" | "completed";
}

export function SessionCard({
  id,
  title,
  instructor,
  completedLessons,
  totalLessons,
  nextSession,
  status,
}: SessionCardProps) {
  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb="xs">
        <Text fw={500}>{title}</Text>
        <Badge color={status === "in-progress" ? "blue" : status === "completed" ? "green" : "gray"}>
          {status === "in-progress" ? "In Progress" : status === "completed" ? "Completed" : "Not Started"}
        </Badge>
      </Group>
      <Group mb="xs">
        <Avatar src={instructor.avatar} size="sm" radius="xl" />
        <Text size="sm">{instructor.name}</Text>
      </Group>
      <Text size="sm" c="dimmed" mb="md">
        <Calendar size={14} style={{ display: "inline", marginRight: 5 }} />
        Next: {nextSession}
      </Text>
      <Progress 
        value={(completedLessons / totalLessons) * 100} 
        size="sm" 
        radius="xs" 
        mb="xs"
      />
      <Group justify="space-between">
        <Text size="xs" c="dimmed">
          {completedLessons} of {totalLessons} lessons completed
        </Text>
        <Button 
          component={Link} 
          href={routes.sessionDetails(id)} 
          variant="light" 
          size="xs" 
          rightSection={<ArrowUpRight size={14} />}
        >
          Details
        </Button>
      </Group>
    </Card>
  );
} 