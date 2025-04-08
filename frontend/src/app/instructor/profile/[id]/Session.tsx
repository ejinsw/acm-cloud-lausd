"use client";

import { Avatar, Button, Card, Group, Rating, Text } from "@mantine/core";


interface Props {
  className?: string;
  session: {
    name: string;
    description: string;
    subject: string;
    time: Date;
  };
}

export function Session({ className, session }: Props) {
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(session.time));

  return (
    <Card className={`w-80 ${className}`} shadow="sm" padding="md" radius="md" withBorder>
      <Group wrap="nowrap" gap="xs" mb="xs">
        <Avatar src={""} alt={session.name} radius="xl" size="md" />
        <div style={{ flex: 1 }}>
          <Text fw={500} size="sm" lineClamp={1}>
            {session.name}
          </Text>
          <Text size="xs" c="dimmed" lineClamp={1}>
            {session.subject}
          </Text>
        </div>
        <Rating value={4} readOnly fractions={2} size="sm" />
      </Group>

      <Text size="sm" lineClamp={3} mb="xs" style={{ minHeight: "3em" }}>
        {session.description}
      </Text>

      <Group justify="space-between" align="center" mt="sm">
        <Group gap="xs">

          <Text size="xs" c="dimmed">
            {formattedTime}
          </Text>
        </Group>

        <Button
          variant="light"
          color="blue"
          size="xs"
          onClick={() => console.log("Booking session...")}
        >
          Join Session
        </Button>
      </Group>
    </Card>
  );
}