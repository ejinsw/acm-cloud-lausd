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
import { useQueueWebSocket } from "../../../hooks/useQueueWebSocket";

interface Subject {
  id: string;
  name: string;
  level?: string;
}

interface ExistingQueue {
  id: number;
  subjectId: string;
  description: string;
  status: string;
  createdAt: string;
  subject?: {
    id: string;
    name: string;
    level?: string;
  };
}

export default function JoinQueuePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [existingQueue, setExistingQueue] = useState<ExistingQueue | null>(null);
  const [formData, setFormData] = useState({
    subjectId: "",
    description: "",
  });

  // Use WebSocket hook for real-time updates
  const { isConnected, connectionError, queueItems, reconnect, refreshQueue } = useQueueWebSocket("STUDENT");

  // Find the current user's queue item from the queue items
  const myQueueItem = queueItems.find(item => {
    // Handle both formats: item.student.id (from instructor endpoint) and item.studentId (from student endpoint)
    const studentId = item.student?.id || item.studentId;
    return studentId === user?.id && item.status === 'PENDING';
  });
  const isInQueue = !!myQueueItem;
  const queueData = myQueueItem
    ? {
        subject: myQueueItem.subject?.name || 'Unknown Subject',
        description: myQueueItem.description || '',
        position: queueItems.filter(item => item.status === 'PENDING').findIndex(item => item.id === myQueueItem.id) + 1,
        estimatedWait: "15-20 minutes", // Could be calculated based on position
      }
    : null;

  // Check for existing queued items that aren't accepted
  const checkExistingQueue = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/queue/student`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch existing queues");
      }

      const data = await response.json();
      const queues = data.queues || [];
      
      // Find the first queue that is not accepted (PENDING status)
      const pendingQueue = queues.find((queue: ExistingQueue) => queue.status === 'PENDING');
      
      if (pendingQueue) {
        setExistingQueue(pendingQueue);
        // Pre-fill the form with existing queue data
        setFormData({
          subjectId: pendingQueue.subjectId,
          description: pendingQueue.description,
        });
      }
    } catch (error) {
      console.error("Failed to check existing queues:", error);
    }
  };

  // Check if student's queue was accepted and redirect to session
  useEffect(() => {
    const checkQueueAccepted = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/queue/student`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const queues = data.queues || [];
          
          // Find recently accepted queue (within last 30 seconds)
          const now = new Date();
          const acceptedQueue = queues.find((q: ExistingQueue) => {
            if (q.status !== 'ACCEPTED') return false;
            
            const updatedAt = new Date(q.createdAt); // Use createdAt as proxy for when it was accepted
            const timeDiff = now.getTime() - updatedAt.getTime();
            
            // Only redirect if accepted within last 30 seconds
            return timeDiff < 30000;
          });
          
          if (acceptedQueue) {
            // Fetch the session associated with this queue
            const sessionsResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/sessions`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (sessionsResponse.ok) {
              const sessionsData = await sessionsResponse.json();
              const sessions = sessionsData.sessions || [];
              
              // Find the most recent session that's still active (within 6 hours)
              const recentSession = sessions.find((s: any) => {
                const sessionStart = new Date(s.startTime);
                const hoursSinceStart = (now.getTime() - sessionStart.getTime()) / (1000 * 60 * 60);
                return hoursSinceStart < 6 && s.status === 'IN_PROGRESS';
              });
              
              if (recentSession) {
                console.log("Queue accepted! Redirecting to session:", recentSession.id);
                router.push(`/sessions/${recentSession.id}`);
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to check queue status:", error);
      }
    };

    // Check immediately and then every 2 seconds
    checkQueueAccepted();
    const interval = setInterval(checkQueueAccepted, 2000);

    return () => clearInterval(interval);
  }, [router]);

  // Load subjects and check for existing queues on component mount
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
    checkExistingQueue();
  }, []);

  // Note: Session creation redirect is handled by the accept queue API response
  // When an instructor accepts a queue item, the API creates a session and returns the session ID
  // The student will be redirected when they receive the QUEUE_UPDATE message

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

      // Refresh the queue data to show the new queue item
      await refreshQueue();
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
    // Get queue ID from either WebSocket data or existing queue data
    const queueId = myQueueItem?.id || existingQueue?.id;
    
    if (!queueId) {
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

      if (response.ok) {
        console.log("Successfully left queue");
        // Refresh queue data to update UI
        await refreshQueue();
        // Clear existing queue state
        setExistingQueue(null);
        setFormData({ subjectId: "", description: "" });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Leave queue request failed:", errorData);
        throw new Error(
          errorData.message || `Failed to leave queue (${response.status})`
        );
      }

      const result = await response.json();
      console.log("Leave queue request successful:", result);

      // Clear existing queue state and reset form
      setExistingQueue(null);
      setFormData({
        subjectId: "",
        description: "",
      });

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

  // Show existing queue status if student is already in queue (from SSE) or has existing pending queue
  if ((isInQueue && queueData) || existingQueue) {
    const displayData = isInQueue && queueData ? queueData : {
      subject: existingQueue ? subjects.find(s => s.id === existingQueue.subjectId)?.name || 'Unknown Subject' : '',
      description: existingQueue?.description || '',
      position: queueData?.position || 0,
      estimatedWait: queueData?.estimatedWait || "15-20 minutes",
    };

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
              <Text fw={500}>{displayData.subject}</Text>
            </Box>

            <Box>
              <Text size="sm" c="dimmed" mb={4}>
                Description
              </Text>
              <Text>{displayData.description}</Text>
            </Box>

            {displayData.position > 0 && (
              <Box>
                <Text size="sm" c="dimmed" mb={4}>
                  Position in Queue
                </Text>
                <Text fw={500} size="lg" c="blue">
                  #{displayData.position}
                </Text>
              </Box>
            )}

            <Box>
              <Text size="sm" c="dimmed" mb={4}>
                Estimated Wait Time
              </Text>
              <Text fw={500}>{displayData.estimatedWait}</Text>
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
