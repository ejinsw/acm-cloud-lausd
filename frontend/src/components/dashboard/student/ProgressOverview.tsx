import { Group, Text, Progress, RingProgress, Box } from "@mantine/core";

interface ProgressOverviewProps {
  completedLessons: number;
  totalLessons: number;
  overallProgress: number;
}

export function ProgressOverview({ completedLessons, totalLessons, overallProgress }: ProgressOverviewProps) {
  return (
    <Box pb="xl" mb="xl" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
      <Group align="flex-start" wrap="nowrap">
        <Box style={{ flex: 1 }}>
          <Text fw={500} mb="xs">Overall Learning Progress</Text>
          <Progress 
            value={overallProgress} 
            size="lg" 
            radius="xs"
            color={overallProgress < 30 ? "red" : overallProgress < 70 ? "yellow" : "green"}
            mb="xs"
          />
          <Text size="sm" c="dimmed">
            {completedLessons} of {totalLessons} lessons completed ({overallProgress}%)
          </Text>
        </Box>
        <RingProgress
          size={100}
          thickness={10}
          roundCaps
          sections={[{ value: overallProgress, color: "blue" }]}
          label={
            <Text ta="center" fw={700} size="lg">
              {overallProgress}%
            </Text>
          }
        />
      </Group>
    </Box>
  );
} 