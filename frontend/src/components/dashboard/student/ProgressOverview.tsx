import { Paper, Group, Text, Progress, RingProgress } from "@mantine/core";

interface ProgressOverviewProps {
  completedLessons: number;
  totalLessons: number;
  overallProgress: number;
}

export function ProgressOverview({ completedLessons, totalLessons, overallProgress }: ProgressOverviewProps) {
  return (
    <Paper p="md" radius="md" withBorder mb="xl">
      <Group align="flex-start">
        <div style={{ flex: 1 }}>
          <Text fw={500} mb="xs">Overall Learning Progress</Text>
          <Progress 
            value={overallProgress} 
            size="lg" 
            radius="md" 
            color={overallProgress < 30 ? "red" : overallProgress < 70 ? "yellow" : "green"}
            mb="xs"
          />
          <Text size="sm" c="dimmed">
            {completedLessons} of {totalLessons} lessons completed ({overallProgress}%)
          </Text>
        </div>
        <RingProgress
          size={120}
          thickness={12}
          roundCaps
          sections={[
            { value: overallProgress, color: "blue" },
          ]}
          label={
            <Text ta="center" fw={700} size="xl">
              {overallProgress}%
            </Text>
          }
        />
      </Group>
    </Paper>
  );
} 