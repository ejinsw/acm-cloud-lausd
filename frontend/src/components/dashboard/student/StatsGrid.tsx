import { Group, Text, Box, SimpleGrid } from "@mantine/core";
import { BookOpen, Clock, Star } from "lucide-react";

interface StatsGridProps {
  totalSessions: number;
  hoursLearned: number;
  reviewCount: number;
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

export function StatsGrid({ totalSessions, hoursLearned, reviewCount }: StatsGridProps) {
  return (
    <Box style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
      <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="lg" py="lg">
        <StatItem label="Total Sessions" value={totalSessions} icon={BookOpen} />
        <StatItem label="Hours spent learning" value={hoursLearned} icon={Clock} />
        <StatItem label="Reviews given" value={reviewCount} icon={Star} />
      </SimpleGrid>
    </Box>
  );
} 