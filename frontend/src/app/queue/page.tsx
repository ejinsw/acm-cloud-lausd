"use client";

import { useAuth } from "../../components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, Text, Button, Group, Card, Stack, Badge } from "@mantine/core";
import { IconUsers, IconUserCheck, IconArrowsRightLeft } from "@tabler/icons-react";

export default function QueuePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (user.role === "STUDENT") {
      router.push("/queue/join");
    } else if (user.role === "INSTRUCTOR") {
      router.push("/queue/instructor");
    }
  }, [user, router]);

  if (!user) {
    return (
      <Box p="xl">
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box p={{ base: "md", sm: "xl" }} maw={900} mx="auto" className="app-page-grid">
      <Card className="app-glass" p="xl">
        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="xl" fw={700}>
              Queue Control Center
            </Text>
            <Badge color="yellow" variant="light">
              Admin
            </Badge>
          </Group>
          <Text c="dimmed">
            Choose a queue perspective. Students submit requests, instructors process them in TutorDeck.
          </Text>
          <Group gap="xs" c="dimmed">
            <IconArrowsRightLeft size={16} />
            <Text size="sm">Real-time handoff with live updates</Text>
          </Group>
        </Stack>
      </Card>

      <Group grow align="stretch">
        <Card className="app-glass" p="lg">
          <Stack gap="md">
            <Group>
              <IconUsers size={20} />
              <Text fw={600}>Student View</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Submit tutoring requests and monitor queue position while waiting for acceptance.
            </Text>
            <Button onClick={() => router.push("/queue/join")}>Open Student Queue</Button>
          </Stack>
        </Card>
        <Card className="app-glass" p="lg">
          <Stack gap="md">
            <Group>
              <IconUserCheck size={20} />
              <Text fw={600}>Instructor View</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Process requests with TutorDeck swipes and keyboard shortcuts, then launch sessions.
            </Text>
            <Button variant="light" onClick={() => router.push("/queue/instructor")}>
              Open TutorDeck
            </Button>
          </Stack>
        </Card>
      </Group>
    </Box>
  );
}
