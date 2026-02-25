import { Group, Text, Box, SimpleGrid } from "@mantine/core";
import { BookOpen, Clock, Sparkles } from "lucide-react";

interface StatsGridProps {
  totalSessions: number;
  hoursLearned: number;
  subjectsCovered: number;
  streak: number;
}

function StatItem({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }> }) {
  return (
    <Group gap="sm">
      <Icon size={20} color="#1971C2" strokeWidth={1.5} />
      <Box>
        <Text size="sm" c="dimmed" tt="uppercase">{label}</Text>
        <Text fw={700} size="xl">{value}</Text>
      </Box>
    </Group>
  );
}

export function StatsGrid({ totalSessions, hoursLearned, subjectsCovered, streak }: StatsGridProps) {
  return (
    <Box mb="xl" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg" py="lg">
        <StatItem label="Total Sessions" value={totalSessions} icon={BookOpen} />
        <StatItem label="Hours Learned" value={hoursLearned} icon={Clock} />
        <StatItem label="Subjects" value={subjectsCovered} icon={BookOpen} />
        <StatItem label="Day Streak" value={streak} icon={Sparkles} />
      </SimpleGrid>
    </Box>
  );
} 