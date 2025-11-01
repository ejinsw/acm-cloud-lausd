"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../components/AuthProvider";
import { useRouter } from "next/navigation";
import {
  Box,
  Text,
  Textarea,
  Select,
  Button,
  Card,
  Stack,
  Alert,
} from "@mantine/core";
import { IconInfoCircle, IconArrowLeft } from "@tabler/icons-react";
import { getToken } from "../../../actions/authentication";
import { useQueueSSE } from "../../../hooks/useQueueSSE";

interface Subject {
  id: string;
  name: string;
  level?: string;
}

export default function JoinQueuePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState({
    subjectId: "",
    description: "",
  });

  // Use SSE hook for real-time updates
  const { myQueueStatus, createdSession } = useQueueSSE("STUDENT");

  // Navigate to session when created
  useEffect(() => {
    if (createdSession) {
      console.log("Session created, navigating to session page:", createdSession.id);
      router.push(`/sessions/${createdSession.id}`);
    }
  }, [createdSession, router]);

  // Derived state from SSE
  const isInQueue = myQueueStatus?.inQueue || false;
  const queueData = myQueueStatus?.queue
    ? {
        subject: myQueueStatus.queue.subject.name,
        description: myQueueStatus.queue.description,
        position: myQueueStatus.position || 0,
        estimatedWait: "15-20 minutes", // Could be calculated based on position
      }
    : null;

  // Load subjects on component mount
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const token = await getToken();
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
          }/api/subjects`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch subjects");
        }

        const data = await response.json();
        setSubjects(data || []);
      } catch (error) {
        console.error("Failed to load subjects:", error);
        setSubjects([]);
      }
    };
    loadSubjects();
  }, []);

  const handleJoinQueue = async () => {
    if (!formData.subjectId || !formData.description.trim()) {
      return;
    }
    setIsLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      console.log("Sending queue request:", {
        subjectId: formData.subjectId,
        description: formData.description,
      });

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/queue`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subjectId: formData.subjectId,
            description: formData.description,
          }),
        }
      );

      console.log("Queue response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Queue request failed:", errorData);
        throw new Error(
          errorData.message || `Failed to join queue (${response.status})`
        );
      }

      const result = await response.json();
      console.log("Queue request successful:", result);

      // The SSE hook will automatically update the state when the queue status changes
      // No need to manually set local state here
    } catch (error) {
      console.error("Failed to join queue:", error);
      // TODO: Show error notification or alert to user
      alert(
        `Failed to join queue: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveQueue = async () => {
    if (!myQueueStatus?.queue?.id) {
      console.error("No queue ID available to leave");
      alert("No queue found to leave");
      return;
    }

    setIsLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const queueId = myQueueStatus.queue.id;
      console.log("Leaving queue with ID:", queueId);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/queue/${queueId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Leave queue response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Leave queue request failed:", errorData);
        throw new Error(
          errorData.message || `Failed to leave queue (${response.status})`
        );
      }

      const result = await response.json();
      console.log("Leave queue request successful:", result);

      // The SSE hook will automatically update the state when the queue status changes
      // No need to manually set local state here
    } catch (error) {
      console.error("Failed to leave queue:", error);
      alert(
        `Failed to leave queue: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== "STUDENT") {
    return (
      <Box p="xl">
        <Text>Access denied. This page is for students only.</Text>
      </Box>
    );
  }

  if (isInQueue && queueData) {
    return (
      <Box p="xl" maw={600} mx="auto">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.back()}
          mb="md"
        >
          Back
        </Button>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Text size="xl" fw={700} c="blue">
              You&apos;re in the queue!
            </Text>

            <Alert
              icon={<IconInfoCircle size={16} />}
              color="blue"
              variant="light"
            >
              Waiting for an instructor to accept your request
            </Alert>

            <Box>
              <Text size="sm" c="dimmed" mb={4}>
                Subject
              </Text>
              <Text fw={500}>{queueData.subject}</Text>
            </Box>

            <Box>
              <Text size="sm" c="dimmed" mb={4}>
                Description
              </Text>
              <Text>{queueData.description}</Text>
            </Box>

            <Box>
              <Text size="sm" c="dimmed" mb={4}>
                Position in Queue
              </Text>
              <Text fw={500} size="lg" c="blue">
                #{queueData.position}
              </Text>
            </Box>

            <Box>
              <Text size="sm" c="dimmed" mb={4}>
                Estimated Wait Time
              </Text>
              <Text fw={500}>{queueData.estimatedWait}</Text>
            </Box>

            <Button
              color="red"
              variant="outline"
              onClick={handleLeaveQueue}
              loading={isLoading}
              fullWidth
            >
              Leave Queue
            </Button>
          </Stack>
        </Card>
      </Box>
    );
  }

  return (
    <Box p="xl" maw={600} mx="auto">
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => router.back()}
        mb="md"
      >
        Back
      </Button>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text size="xl" fw={700}>
            Join Tutoring Queue
          </Text>

          <Text c="dimmed">
            Get help from an instructor by joining the queue. You&apos;ll be
            matched with an available instructor.
          </Text>

          <Select
            label="Subject"
            placeholder="Select a subject"
            data={subjects.map((subject) => ({
              value: subject.id,
              label: subject.name,
            }))}
            value={formData.subjectId}
            onChange={(value) => {
              console.log("Subject changed:", value);
              setFormData((prev) => ({ ...prev, subjectId: value || "" }));
            }}
            required
          />

          <Textarea
            label="Description"
            placeholder="Describe what you need help with..."
            value={formData.description}
            onChange={(event) => {
              const value = event?.currentTarget?.value || "";
              console.log("Description changed:", value);
              setFormData((prev) => ({
                ...prev,
                description: value,
              }));
            }}
            minRows={4}
            required
          />

          <Button
            onClick={handleJoinQueue}
            loading={isLoading}
            disabled={!formData.subjectId || !formData.description.trim()}
            fullWidth
            size="lg"
          >
            Join Queue
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}
