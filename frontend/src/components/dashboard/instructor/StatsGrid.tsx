import { Grid, Paper, Text, Title, Group } from "@mantine/core";
import { Star } from "lucide-react";

interface StatsGridProps {
  totalStudents: number;
  hoursTutored: number;
  averageRating: number;
  totalSessions: number;
}

export function StatsGrid({
  totalStudents,
  hoursTutored,
  averageRating,
  totalSessions,
}: StatsGridProps) {
  return (
    <Grid mb="xl">
      <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
        <Paper p="md" radius="md" withBorder h={130}>
          <Text size="xs" c="dimmed" tt="uppercase">Total Students</Text>
          <Title order={3} fw={700} mt="xs">{totalStudents}</Title>
          <Text size="sm" c="dimmed" mt="md">
            Across {totalSessions} sessions
          </Text>
        </Paper>
      </Grid.Col>
      
      <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
        <Paper p="md" radius="md" withBorder h={130}>
          <Text size="xs" c="dimmed" tt="uppercase">Hours Tutored</Text>
          <Title order={3} fw={700} mt="xs">{hoursTutored}</Title>
          <Text size="sm" c="dimmed" mt="md">
            Over {totalSessions} sessions
          </Text>
        </Paper>
      </Grid.Col>
      
      <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
        <Paper p="md" radius="md" withBorder h={130}>
          <Text size="xs" c="dimmed" tt="uppercase">Average Rating</Text>
          <Title order={3} fw={700} mt="xs">{averageRating.toFixed(1)}</Title>
          <Group mt="md">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < Math.round(averageRating) ? "#FFD700" : "none"}
                color={i < Math.round(averageRating) ? "#FFD700" : "#CCC"}
              />
            ))}
          </Group>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}
