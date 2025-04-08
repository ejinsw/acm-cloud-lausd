"use client";

import { Avatar, Card, Group, Rating, Text } from "@mantine/core";

interface Props {
  className?: string;
  review: {
    username: string;
    rating: number;
    content: string;
  };
}

export function Review({ className, review }: Props) {
  return (
    <Card className={`w-80 ${className}`} shadow="sm" padding="md" radius="md" withBorder>
      <Group wrap="nowrap" gap="xs" mb="xs">
        <Avatar src={""} alt={review.username} radius="xl" size="md" />
        <div style={{ flex: 1 }}>
          <Text fw={500} size="sm" lineClamp={1}>
            {review.username}
          </Text>
        </div>
        <Rating value={review.rating} readOnly fractions={2} size="sm" />
      </Group>

      <Text size="sm" lineClamp={3} mb="sm" style={{ minHeight: "3em" }}>
        {review.content}
      </Text>
    </Card>
  );
}