"use client";

import { useState, useEffect, useMemo } from "react";
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
  Group,
  Badge,
  Loader,
  Center,
  RingProgress,
} from "@mantine/core";
import { IconInfoCircle, IconArrowLeft, IconClockHour4 } from "@tabler/icons-react";
import { getToken } from "../../../actions/authentication";
import { useQueueWebSocket } from "../../../hooks/useQueueWebSocket";
import { notifications } from "@mantine/notifications";
import { CheckCircle2, Star, XCircle } from "lucide-react";

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
  queuePosition?: number;
  estimatedWaitMinutes?: number;
}

export default function JoinQueuePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [existingQueue, setExistingQueue] = useState<ExistingQueue | null>(null);
  const [formData, setFormData] = useState({ subjectId: "", description: "" });

  const { queueItems, subscribeQueue, unsubscribeQueue } = useQueueWebSocket(user);
  const queueItemsArray = Array.from(queueItems.values());

  const myQueueItem = useMemo(
    () =>
      queueItemsArray.find((item) => {
        const studentId = item.student?.id || item.studentId;
        return studentId === user?.id && item.status === "PENDING";
      }),
    [queueItemsArray, user?.id],
  );

  const isInQueue = !!myQueueItem || !!existingQueue;
  const queuePosition =
    myQueueItem?.queuePosition ||
    existingQueue?.queuePosition ||
    Math.max(
      1,
      queueItemsArray
        .filter((item) => item.status === "PENDING")
        .findIndex((item) => item.id === myQueueItem?.id) + 1,
    );
  const estimatedWaitMinutes = myQueueItem?.estimatedWaitMinutes || existingQueue?.estimatedWaitMinutes || 15;

  const checkExistingQueue = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/queue/student`,
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        },
      );
      if (!response.ok) return;
      const data = await response.json();
      const pending = (data.queues || []).find((queue: ExistingQueue) => queue.status === "PENDING");
      if (pending) {
        setExistingQueue(pending);
        setFormData({ subjectId: pending.subjectId, description: pending.description });
      }
    } catch (error) {
      console.error("Failed to check existing queue:", error);
    }
  };

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const token = await getToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/subjects`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!response.ok) throw new Error("Failed to load subjects");
        const data = await response.json();
        setSubjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load subjects:", error);
        setSubjects([]);
      }
    };

    void loadSubjects();
    void checkExistingQueue();
  }, []);

  useEffect(() => {
    const checkQueueAccepted = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/queue/student`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!response.ok) return;

        const data = await response.json();
        const queues = data.queues || [];
        const acceptedQueue = queues.find((q: ExistingQueue) => q.status === "ACCEPTED");
        if (!acceptedQueue) return;

        const sessionsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/sessions`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!sessionsResponse.ok) return;

        const sessionsData = await sessionsResponse.json();
        const sessions = sessionsData.sessions || [];
        const now = Date.now();
        const recentSession = sessions.find((session: any) => {
          const start = new Date(session.startTime).getTime();
          const hoursSinceStart = (now - start) / (1000 * 60 * 60);
          return hoursSinceStart < 6 && session.status === "IN_PROGRESS";
        });
        if (recentSession) {
          router.push(`/sessions/${recentSession.id}`);
        }
      } catch (error) {
        console.error("Failed to check queue status:", error);
      }
    };

    void checkQueueAccepted();
    const interval = setInterval(() => void checkQueueAccepted(), 2000);
    return () => clearInterval(interval);
  }, [router]);

  const handleJoinQueue = async () => {
    if (!formData.subjectId || !formData.description.trim() || !user) return;
    setIsLoading(true);
    try {
      const subject = subjects.find((item) => item.id === formData.subjectId);
      if (!subject) throw new Error("Subject not found");

      subscribeQueue("student", {
        description: formData.description,
        subjectId: formData.subjectId,
        student: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          cognitoId: user.cognitoId || user.id,
          averageRating: user.averageRating,
        },
        subject: {
          id: subject.id,
          name: subject.name,
          level: subject.level || null,
          description: "",
          category: "",
        },
      });

      notifications.show({
        title: "Joined queue",
        message: "Your request is live. We will notify you as soon as an instructor accepts.",
        color: "green",
        icon: <CheckCircle2 size={16} />,
      });
      setExistingQueue(null);
    } catch (error) {
      console.error("Failed to join queue:", error);
      notifications.show({
        title: "Error",
        message: "Could not join queue. Please try again.",
        color: "red",
        icon: <XCircle size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveQueue = async () => {
    setIsLoading(true);
    try {
      unsubscribeQueue("student");
      setExistingQueue(null);
      setFormData({ subjectId: "", description: "" });
      notifications.show({
        title: "Left queue",
        message: "Your request has been removed.",
        color: "green",
        icon: <CheckCircle2 size={16} />,
      });
    } catch (error) {
      console.error("Failed to leave queue:", error);
      notifications.show({
        title: "Error",
        message: "Could not leave queue. Please try again.",
        color: "red",
        icon: <XCircle size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const waitingSubject =
    myQueueItem?.subject?.name || subjects.find((subject) => subject.id === existingQueue?.subjectId)?.name;

  return (
    <Box p={{ base: "md", sm: "xl" }} maw={720} mx="auto" className="app-page-grid">
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => router.back()}
        w="fit-content"
      >
        Back
      </Button>

      {!isInQueue ? (
        <Card className="app-glass" p={{ base: "lg", sm: "xl" }}>
          <Stack gap="lg">
            <Box>
              <Text size="xl" fw={700}>
                Request a Tutor
              </Text>
              <Text c="dimmed" size="sm">
                Share what you need help with. We will match you with an available instructor.
              </Text>
              <Group mt="xs">
                <Badge size="sm" color="yellow" variant="light" leftSection={<Star size={12} />}>
                  Your rating: {user?.averageRating ? `${user.averageRating.toFixed(1)}/5` : "No rating yet"}
                </Badge>
              </Group>
            </Box>

            <Select
              label="Subject"
              placeholder="Choose a subject"
              data={subjects.map((subject) => ({ value: subject.id, label: subject.name }))}
              value={formData.subjectId}
              onChange={(value) => setFormData((prev) => ({ ...prev, subjectId: value || "" }))}
              required
              searchable
            />

            <Textarea
              label="Describe your question"
              placeholder="Mention topic, assignment context, and what feels difficult right now."
              minRows={5}
              value={formData.description}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, description: event.currentTarget.value }))
              }
              required
            />

            <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
              Keep it specific to get faster, more accurate help.
            </Alert>

            <Button
              onClick={handleJoinQueue}
              loading={isLoading}
              disabled={!formData.subjectId || !formData.description.trim()}
              size="lg"
            >
              Join Queue
            </Button>
          </Stack>
        </Card>
      ) : (
        <Card className="app-glass" p={{ base: "lg", sm: "xl" }}>
          <Stack gap="lg" align="center">
            <RingProgress
              size={120}
              thickness={10}
              sections={[{ value: 100, color: "blue" }]}
              label={
                <Center>
                  <Loader size="sm" />
                </Center>
              }
            />
            <Stack gap={4} align="center">
              <Text size="xl" fw={700}>
                You are in line
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                Stay on this page. You will be redirected when your instructor accepts.
              </Text>
            </Stack>
            <Group>
              <Badge size="lg" color="yellow" variant="light">
                Position #{queuePosition}
              </Badge>
              <Badge size="lg" color="blue" variant="light">
                Est. {estimatedWaitMinutes} min
              </Badge>
              <Badge size="lg" color="orange" variant="light" leftSection={<Star size={12} />}>
                Your rating: {user?.averageRating ? `${user.averageRating.toFixed(1)}/5` : "No rating"}
              </Badge>
            </Group>
            <Card withBorder w="100%" p="md">
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Subject
                </Text>
                <Text fw={600}>{waitingSubject || "Not available"}</Text>
                <Text size="sm" c="dimmed" mt="sm">
                  Request
                </Text>
                <Text>{myQueueItem?.description || existingQueue?.description || formData.description}</Text>
              </Stack>
            </Card>
            <Group gap="xs" c="dimmed">
              <IconClockHour4 size={16} />
              <Text size="sm">Live queue updates enabled</Text>
            </Group>
            <Button color="red" variant="outline" onClick={handleLeaveQueue} loading={isLoading}>
              Leave Queue
            </Button>
          </Stack>
        </Card>
      )}
    </Box>
  );
}
