"use client";

import { Card, Avatar, Text, Group, Button, Rating } from '@mantine/core';

interface SessionCardProps {
  tutorName: string;
  tutorImage?: string;
  rating: number;
  subject: string;
  description: string;
  onJoinSession: () => void;
}

export function SessionCard({
  tutorName,
  tutorImage,
  rating,
  subject,
  description,
  onJoinSession,
}: SessionCardProps) {
  return (
    <Card shadow="sm" padding="md" radius="md" withBorder h="100%">
      <Group wrap="nowrap" gap="xs" mb="xs">
        <Avatar
          src={tutorImage}
          alt={tutorName}
          radius="xl"
          size="md"
        />
        <div style={{ flex: 1 }}>
          <Text fw={500} size="sm" lineClamp={1}>{tutorName}</Text>
          <Text size="xs" c="dimmed" lineClamp={1}>{subject}</Text>
        </div>
        <Rating value={rating} readOnly fractions={2} size="sm" />
      </Group>

      <Text size="sm" lineClamp={2} mb="sm" style={{ minHeight: '2.5em' }}>
        {description}
      </Text>

      <Button
        fullWidth
        variant="light"
        color="blue"
        size="xs"
        onClick={onJoinSession}
        leftSection={<Text size="xs">1 hour</Text>}
      >
        Join Session
      </Button>
    </Card>
  );
}
