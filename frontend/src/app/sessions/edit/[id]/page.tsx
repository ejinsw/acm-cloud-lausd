"use client";

import { Container, Paper, Stack, Title, Text, Button, Group } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { routes } from "@/app/routes";

export default function EditSessionPage() {
  const router = useRouter();

  return (
    <Container size="md" py="xl" className="app-page-enter">
      <Paper p="xl" radius="md" withBorder className="app-glass">
        <Stack gap="md">
          <Title order={2}>Scheduled Sessions Are Disabled</Title>
          <Text c="dimmed">
            Session editing is unavailable because scheduled session workflows are not enabled in this release.
          </Text>
          <Group>
            <Button variant="light" leftSection={<ArrowLeft size={16} />} onClick={() => router.back()}>
              Go Back
            </Button>
            <Button onClick={() => router.push(routes.instructorQueue)}>Open TutorDeck</Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
