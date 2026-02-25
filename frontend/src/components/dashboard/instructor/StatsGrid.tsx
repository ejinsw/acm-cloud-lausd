import { Text, Title, Group, Box, SimpleGrid } from "@mantine/core";
import { Star, Users, Clock } from "lucide-react";

interface StatsGridProps {
  totalStudents: number;
  hoursTutored: number;
  averageRating: number;
  totalSessions: number;
}

function StatItem({ label, value, subtext, icon: Icon }: { 
  label: string; 
  value: React.ReactNode; 
  subtext?: string; 
  icon?: React.ComponentType<{ size?: number; color?: string }> 
}) {
  return (
    <Group gap="sm">
      {Icon && <Icon size={20} color="#1971C2" />}
      <Box>
        <Text size="xs" c="dimmed" tt="uppercase">{label}</Text>
        <Title order={3} fw={700} mt={4}>{value}</Title>
        {subtext && <Text size="sm" c="dimmed" mt="xs">{subtext}</Text>}
      </Box>
    </Group>
  );
}

export function StatsGrid({
  totalStudents,
  hoursTutored,
  averageRating,
  totalSessions,
}: StatsGridProps) {
  return (
    <Box py="lg" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        <StatItem 
          label="Total Students" 
          value={totalStudents} 
          subtext={`Across ${totalSessions} sessions`}
          icon={Users}
        />
        <StatItem 
          label="Hours Tutored" 
          value={hoursTutored} 
          subtext={`Over ${totalSessions} sessions`}
          icon={Clock}
        />
        <StatItem 
          label="Average Rating" 
          value={
            <Group gap="xs">
              <span>{averageRating.toFixed(1)}</span>
              <Group gap={2}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    fill={i < Math.round(averageRating) ? "#FFD700" : "none"}
                    color={i < Math.round(averageRating) ? "#FFD700" : "#CCC"}
                  />
                ))}
              </Group>
            </Group>
          }
          icon={Star}
        />
      </SimpleGrid>
    </Box>
  );
}
