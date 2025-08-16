"use client";

import { useEffect, useState } from "react";
import { Container, Title, Text, Paper, Group, Button, Alert, Loader, Box } from "@mantine/core";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { getToken } from "@/actions/authentication";
import { Session } from "@/lib/types";
import CreateSessionForm from "../../create/CreateSessionForm";

export default function EditSessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = await getToken();
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError('Session not found');
          } else if (response.status === 403) {
            setError('You do not have permission to edit this session');
          } else {
            setError(`Failed to fetch session: ${response.status}`);
          }
          return;
        }

        const sessionData = await response.json();
        setSession(sessionData.session);
      } catch (error) {
        console.error('Error fetching session:', error);
        setError('Failed to fetch session data');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <Box ta="center" py="xl">
          <Loader size="lg" />
          <Text mt="md">Loading session...</Text>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<AlertCircle size={16} />} title="Error" color="red">
          {error}
        </Alert>
        <Group mt="md">
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
          <Button onClick={() => router.push("/dashboard/instructor")}>
            Go to Dashboard
          </Button>
        </Group>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<AlertCircle size={16} />} title="Session Not Found" color="red">
          The session you're looking for could not be found.
        </Alert>
        <Group mt="md">
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
          <Button onClick={() => router.push("/dashboard/instructor")}>
            Go to Dashboard
          </Button>
        </Group>
      </Container>
    );
  }

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
            <Title order={2}>Edit Session</Title>
            <Text c="dimmed">Update your session details</Text>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push("/dashboard/instructor")}
          >
            Cancel
          </Button>
        </Group>
      </Paper>

      {/* Edit Session Form */}
      <CreateSessionForm 
        mode="edit" 
        existingSession={session}
        onSuccess={() => router.push("/dashboard/instructor")}
      />
    </Container>
  );
}
