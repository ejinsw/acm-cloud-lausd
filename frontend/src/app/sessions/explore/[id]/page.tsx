"use client";

import { Container, Paper, Stack, Title, Text, Button, Group } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { routes } from "@/app/routes";

export default function SessionDetailsPage() {
  const router = useRouter();

  return (
    <Container size="md" py="xl" className="app-page-enter">
      <Paper p="xl" radius="md" withBorder className="app-glass">
        <Stack gap="md">
          <Title order={2}>Session Details Are Unavailable</Title>
          <Text c="dimmed">
            Scheduled session detail pages are disabled in this release. Use the live queue to request immediate tutoring.
          </Text>
          <Group>
            <Button variant="light" leftSection={<ArrowLeft size={16} />} onClick={() => router.back()}>
              Go Back
            </Button>
            <Button onClick={() => router.push(routes.queue)}>Open Queue</Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
