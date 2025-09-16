"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../components/AuthProvider";
import { useRouter } from "next/navigation";
import {
  Box,
  Text,
  TextInput,
  Textarea,
  Select,
  Button,
  Card,
  Group,
  Stack,
  Alert,
  Loader,
} from "@mantine/core";
import { IconInfoCircle, IconArrowLeft } from "@tabler/icons-react";
import { getToken } from "../../../actions/authentication";

interface Subject {
  id: string;
  name: string;
  level?: string;
}

export default function JoinQueuePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isInQueue, setIsInQueue] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [queueData, setQueueData] = useState<{
    subject: string;
    description: string;
    position: number;
    estimatedWait: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    subjectId: "",
    description: "",
  });

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
      // Use mock data instead of API call for now
      const selectedSubject = subjects.find((s) => s.id === formData.subjectId);
      setQueueData({
        subject: selectedSubject?.name || "Unknown Subject",
        description: formData.description,
        position: 1,
        estimatedWait: "15-20 minutes",
      });
      setIsInQueue(true);
    } catch (error) {
      console.error("Failed to join queue:", error);
    } finally {
      setIsLoading(false);
    }

    setIsLoading(true);

    try {
      const token = await getToken();
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

      if (!response.ok) {
        throw new Error("Failed to join queue");
      }

      const data = await response.json();
      const selectedSubject = subjects.find((s) => s.id === formData.subjectId);
      setQueueData({
        subject: selectedSubject?.name || "Unknown Subject",
        description: formData.description,
        position: data.position || 1,
        estimatedWait: data.estimatedWait || "15-20 minutes",
      });
      setIsInQueue(true);
    } catch (error) {
      console.error("Failed to join queue:", error);
      // Show error notification or alert
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveQueue = async () => {
    setIsLoading(true);

    try {
      // TODO: Implement leave queue API call
      // const token = await getToken();
      // const response = await fetch(
      //   `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/queue/${queueId}`,
      //   {
      //     method: "DELETE",
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );
      // For now, just reset local state
      setIsInQueue(false);
      setQueueData(null);
    } catch (error) {
      console.error("Failed to leave queue:", error);
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
              You're in the queue!
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
            Get help from an instructor by joining the queue. You'll be matched
            with an available instructor.
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
