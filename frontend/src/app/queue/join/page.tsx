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
import { notifications } from "@mantine/notifications";
import { CheckCircle2, XCircle } from "lucide-react";

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
  const [existingQueue, setExistingQueue] = useState<ExistingQueue | null>(
    null,
  );
  const [formData, setFormData] = useState({
    subjectId: "",
    description: "",
  });

  // Use WebSocket hook for real-time updates
  const { queueItems, subscribeQueue, unsubscribeQueue } =
    useQueueWebSocket(user);

  // Find the current user's queue item from the queue items
  const queueItemsArray = Array.from(queueItems.values());
  console.log("[Student Queue] Queue items array:", queueItemsArray);
  console.log("[Student Queue] User ID:", user?.id);
  const myQueueItem = queueItemsArray.find((item) => {
    // Handle both formats: item.student.id (from instructor endpoint) and item.studentId (from student endpoint)
    const studentId = item.student?.id || item.studentId;
    console.log("[Student Queue] Checking item:", { itemStudentId: studentId, itemStatus: item.status, userId: user?.id });
    return studentId === user?.id && item.status === "PENDING";
  });
  console.log("[Student Queue] My queue item:", myQueueItem);
  const isInQueue = !!myQueueItem;
  const queueData = myQueueItem
    ? {
        subject: myQueueItem.subject?.name || "Unknown Subject",
        description: myQueueItem.description || "",
        position:
          queueItemsArray
            .filter((item) => item.status === "PENDING")
            .findIndex((item) => item.id === myQueueItem.id) + 1,
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
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch existing queues");
      }

      const data = await response.json();
      const queues = data.queues || [];

      // Find the first queue that is not accepted (PENDING status)
      const pendingQueue = queues.find(
        (queue: ExistingQueue) => queue.status === "PENDING",
      );

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
          },
        );

        if (response.ok) {
          const data = await response.json();
          const queues = data.queues || [];

          // Find recently accepted queue (within last 30 seconds)
          const now = new Date();
          const acceptedQueue = queues.find((q: ExistingQueue) => {
            if (q.status !== "ACCEPTED") return false;

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
              },
            );

            if (sessionsResponse.ok) {
              const sessionsData = await sessionsResponse.json();
              const sessions = sessionsData.sessions || [];

              // Find the most recent session that's still active (within 6 hours)
              const recentSession = sessions.find((s: any) => {
                const sessionStart = new Date(s.startTime);
                const hoursSinceStart =
                  (now.getTime() - sessionStart.getTime()) / (1000 * 60 * 60);
                return hoursSinceStart < 6 && s.status === "IN_PROGRESS";
              });

              if (recentSession) {
                console.log(
                  "Queue accepted! Redirecting to session:",
                  recentSession.id,
                );
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
          },
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
    if (!formData.subjectId || !formData.description.trim() || !user) {
      return;
    }
    setIsLoading(true);

    try {
      console.log("Joining queue...");

      // Find subject from already-loaded subjects list
      const subject = subjects.find((s) => s.id === formData.subjectId);
      
      if (!subject) {
        throw new Error("Subject not found");
      }

      // Send enriched data to WebSocket
      subscribeQueue("student", {
        description: formData.description,
        subjectId: formData.subjectId,
        student: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          cognitoId: (user as any).cognitoId || user.id, // Use id as fallback if cognitoId not present
        },
        subject: {
          id: subject.id,
          name: subject.name,
          level: subject.level || null,
          description: "", // Optional field
          category: "", // Optional field
        },
      });

      notifications.show({
        title: "Success!",
        message: "You have successfully joined the queue.",
        color: "green",
        icon: <CheckCircle2 size={16} />,
        autoClose: 5000,
      });
    } catch (error) {
      console.error("Failed to join queue:", error);
      notifications.show({
        title: "Error",
        message: "Failure processing request. Try again.",
        color: "red",
        icon: <XCircle size={16} />,
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveQueue = async () => {
    if (!myQueueItem && !existingQueue) {
      console.error("No queue found to leave");
      alert("No queue found to leave");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Leaving queue...");

      // Unsubscribe via WebSocket (uses student's user ID)
      unsubscribeQueue("student");

      // Clear existing queue state and reset form
      setExistingQueue(null);
      setFormData({
        subjectId: "",
        description: "",
      });
      notifications.show({
        title: "Success!",
        message: "You have successfully left the queue.",
        color: "green",
        icon: <CheckCircle2 size={16} />,
        autoClose: 5000,
      });
    } catch (error) {
      console.error("Failed to leave queue:", error);
      notifications.show({
        title: "Error",
        message: "Failure processing request. Try again.",
        color: "red",
        icon: <XCircle size={16} />,
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show existing queue status if student is already in queue (from SSE) or has existing pending queue
  if ((isInQueue && queueData) || existingQueue) {
    const displayData =
      isInQueue && queueData
        ? queueData
        : {
            subject: existingQueue
              ? subjects.find((s) => s.id === existingQueue.subjectId)?.name ||
                "Unknown Subject"
              : "",
            description: existingQueue?.description || "",
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
