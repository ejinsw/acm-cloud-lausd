"use client";

import {
  Card,
  Stack,
  Text,
  Button,
  Box,
  Group,
  Badge,
  Alert,
} from "@mantine/core";
import { IconInfoCircle, IconClock, IconX } from "@tabler/icons-react";

interface WaitingScreenProps {
  subject: string;
  description: string;
  position: number;
  estimatedWait: string;
  onLeaveQueue: () => void;
  isLoading?: boolean;
}

export function WaitingScreen({
  subject,
  description,
  position,
  estimatedWait,
  onLeaveQueue,
  isLoading = false,
}: WaitingScreenProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="center" mb="md">
          <Text size="xl" fw={700} c="blue">
            You're in the queue!
          </Text>
        </Group>

        <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
          Waiting for an instructor to accept your request
        </Alert>

        <Box>
          <Text size="sm" c="dimmed" mb={4}>
            Subject
          </Text>
          <Badge size="lg" color="blue" variant="light">
            {subject}
          </Badge>
        </Box>

        <Box>
          <Text size="sm" c="dimmed" mb={4}>
            Description
          </Text>
          <Text>{description}</Text>
        </Box>

        <Group justify="space-between">
          <Box>
            <Text size="sm" c="dimmed" mb={4}>
              Position in Queue
            </Text>
            <Group gap="xs">
              <IconClock size={16} />
              <Text fw={500} size="lg" c="blue">
                #{position}
              </Text>
            </Group>
          </Box>

          <Box>
            <Text size="sm" c="dimmed" mb={4}>
              Estimated Wait Time
            </Text>
            <Text fw={500}>{estimatedWait}</Text>
          </Box>
        </Group>

        <Button
          color="red"
          variant="outline"
          leftSection={<IconX size={16} />}
          onClick={onLeaveQueue}
          loading={isLoading}
          fullWidth
          size="lg"
        >
          Leave Queue
        </Button>
      </Stack>
    </Card>
  );
}
