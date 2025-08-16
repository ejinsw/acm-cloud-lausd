"use client";

import { Container, Title, Text, Paper, Group, Button } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import CreateSessionForm from "./CreateSessionForm";

export default function CreateSessionPage() {
  const router = useRouter();

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <Paper p="xl" radius="md" withBorder mb="xl">
        <Group justify="space-between" mb="lg">
          <div>
            <Group gap="md" mb="xs">
              <Button 
                variant="subtle" 
                leftSection={<ArrowLeft size={16} />}
                onClick={() => router.back()}
              >
                Back
              </Button>
            </Group>
            <Title order={2}>Create New Session</Title>
            <Text c="dimmed">Build your tutoring session with our interactive builder</Text>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push("/dashboard/instructor")}
          >
            Cancel
          </Button>
        </Group>
      </Paper>

      {/* Session Creation Form */}
      <CreateSessionForm 
        mode="create"
        onSuccess={() => router.push("/dashboard/instructor")}
      />
    </Container>
  );
} 