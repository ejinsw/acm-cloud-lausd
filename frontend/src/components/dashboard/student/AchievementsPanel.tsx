import { Grid, Paper, Title, Text, Box } from "@mantine/core";

interface AchievementsPanelProps {
  totalSessions: number;
  hoursLearned: number;
  subjectsCovered: number;
  streak: number;
}

export function AchievementsPanel({ totalSessions, hoursLearned, subjectsCovered, streak }: AchievementsPanelProps) {
  return (
    <>
      <Title order={3} mb="md">Your Learning Achievements</Title>
      
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" radius="md" withBorder>
            <Title order={4} mb="lg">Learning Stats</Title>
            <Grid>
              <Grid.Col span={6}>
                <Text fw={700} size="xl" ta="center">{totalSessions}</Text>
                <Text ta="center" size="sm">Sessions Attended</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text fw={700} size="xl" ta="center">{hoursLearned}</Text>
                <Text ta="center" size="sm">Hours Learned</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text fw={700} size="xl" ta="center">{subjectsCovered}</Text>
                <Text ta="center" size="sm">Subjects Covered</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text fw={700} size="xl" ta="center">{streak}</Text>
                <Text ta="center" size="sm">Day Streak</Text>
              </Grid.Col>
            </Grid>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" radius="md" withBorder h="100%">
            <Title order={4} mb="lg">Completed Subjects</Title>
            <Box ta="center">
              <Text>Subject completion badges will appear here</Text>
              <Text size="sm" c="dimmed" mt="md">
                Complete all sessions in a subject to earn a badge
              </Text>
            </Box>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={12}>
          <Paper p="md" radius="md" withBorder>
            <Title order={4} mb="lg">Learning Journey</Title>
            <Text ta="center">
              Your learning timeline will be shown here as you progress through your courses.
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>
    </>
  );
} 