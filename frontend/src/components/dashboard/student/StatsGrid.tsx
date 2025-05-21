import { Grid, Paper, Text, Group } from "@mantine/core";
import { BookOpen, Clock, Sparkles } from "lucide-react";

interface StatsGridProps {
  totalSessions: number;
  hoursLearned: number;
  subjectsCovered: number;
  streak: number;
}

export function StatsGrid({ totalSessions, hoursLearned, subjectsCovered, streak }: StatsGridProps) {
  return (
    <Grid mb="xl">
      <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
        <Paper p="md" radius="md" withBorder>
          <Text size="sm" c="dimmed" tt="uppercase" mb="xs">Total Sessions</Text>
          <Group align="center">
            <BookOpen size={20} color="#1971C2" strokeWidth={1.5} />
            <Text fw={700} size="xl">{totalSessions}</Text>
          </Group>
        </Paper>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
        <Paper p="md" radius="md" withBorder>
          <Text size="sm" c="dimmed" tt="uppercase" mb="xs">Hours Learned</Text>
          <Group align="center">
            <Clock size={20} color="#1971C2" strokeWidth={1.5} />
            <Text fw={700} size="xl">{hoursLearned}</Text>
          </Group>
        </Paper>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
        <Paper p="md" radius="md" withBorder>
          <Text size="sm" c="dimmed" tt="uppercase" mb="xs">Subjects</Text>
          <Group align="center">
            <BookOpen size={20} color="#1971C2" strokeWidth={1.5} />
            <Text fw={700} size="xl">{subjectsCovered}</Text>
          </Group>
        </Paper>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
        <Paper p="md" radius="md" withBorder>
          <Text size="sm" c="dimmed" tt="uppercase" mb="xs">Day Streak</Text>
          <Group align="center">
            <Sparkles size={20} color="#1971C2" strokeWidth={1.5} />
            <Text fw={700} size="xl">{streak}</Text>
          </Group>
        </Paper>
      </Grid.Col>
    </Grid>
  );
} 