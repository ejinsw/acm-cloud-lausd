import { Title, Grid, Text, Button, Box } from "@mantine/core";
import Link from "next/link";
import { Session } from "@/lib/types";
import { SessionCard } from "./SessionCard";

interface UpcomingSessionsTabProps {
  sessions: Session[];
}

export function UpcomingSessionsTab({ sessions }: UpcomingSessionsTabProps) {
  // Filter for upcoming sessions (SCHEDULED or IN_PROGRESS)
  const upcomingSessions = sessions.filter(session => 
    session.status === 'SCHEDULED' || session.status === 'IN_PROGRESS'
  );

  if (upcomingSessions.length === 0) {
    return (
      <Box>
        <Title order={4} mb="md">Upcoming Sessions</Title>
        <Text c="dimmed" ta="center" py="xl">
          No upcoming sessions scheduled. 
          <Button 
            component={Link} 
            href="/sessions/create" 
            variant="subtle" 
            size="sm" 
            ml="xs"
          >
            Create your first session
          </Button>
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Title order={4} mb="md">Upcoming Sessions</Title>
      <Grid>
        {upcomingSessions.map((session) => (
          <Grid.Col key={session.id} span={{ base: 12, sm: 6, md: 4 }}>
            <SessionCard session={session} />
          </Grid.Col>
        ))}
      </Grid>
    </Box>
  );
}
