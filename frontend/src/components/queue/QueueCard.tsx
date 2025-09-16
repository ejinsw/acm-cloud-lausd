"use client";

import { Card, Group, Text, Badge, Avatar, Box, Stack } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";

interface QueueCardProps {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  subject: string;
  description: string;
  joinedAt: Date;
  priority: "high" | "medium" | "low";
  canTeach?: boolean;
  onAccept?: () => void;
  isLoading?: boolean;
}

export function QueueCard({
  student,
  subject,
  description,
  joinedAt,
  priority,
  canTeach = true,
  onAccept,
  isLoading = false,
}: QueueCardProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "yellow";
      case "low":
        return "green";
      default:
        return "gray";
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" align="flex-start">
        <Group gap="md" style={{ flex: 1 }}>
          <Avatar color="blue" radius="xl">
            {student.firstName[0]}
            {student.lastName[0]}
          </Avatar>

          <Box style={{ flex: 1 }}>
            <Group gap="xs" mb="xs">
              <Text fw={600} size="lg">
                {student.firstName} {student.lastName}
              </Text>
              <Badge
                color={getPriorityColor(priority)}
                size="sm"
                variant="light"
              >
                {priority}
              </Badge>
            </Group>

            <Text size="sm" c="dimmed" mb="xs">
              {student.email}
            </Text>

            <Group gap="xs" mb="sm">
              <Badge color="blue" variant="outline">
                {subject}
              </Badge>
              <Group gap={4}>
                <IconClock size={14} />
                <Text size="sm" c="dimmed">
                  {formatTimeAgo(joinedAt)}
                </Text>
              </Group>
            </Group>

            <Text size="sm" mb="md">
              {description}
            </Text>
          </Box>
        </Group>

        {onAccept && (
          <Group gap="sm">
            <Badge
              color={canTeach ? "green" : "orange"}
              variant="light"
              size="sm"
            >
              {canTeach ? "Your Subject" : "Outside Expertise"}
            </Badge>
          </Group>
        )}
      </Group>
    </Card>
  );
}
