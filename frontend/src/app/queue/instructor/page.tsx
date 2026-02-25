"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../components/AuthProvider";
import { useRouter } from "next/navigation";
import {
  Box,
  Text,
  Card,
  Group,
  Stack,
  Button,
  Badge,
  Avatar,
  Alert,
  Loader,
  Center,
  ScrollArea,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconUser,
  IconAlertTriangle,
  IconCheck,
  IconWifi,
  IconWifiOff,
  IconRefresh,
  IconVideo,
} from "@tabler/icons-react";
import { getToken } from "../../../actions/authentication";
import { useQueueWebSocket } from "../../../hooks/useQueueWebSocket";
import { useZoomStatus } from "../../../hooks/useZoomStatus";
import { notifications } from "@mantine/notifications";
import { XCircle } from "lucide-react";

interface EnrichedQueueItem {
  id: number;
  description: string;
  status: string;
  createdAt: string;
  studentId: string;
  subjectId: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  subject?: {
    id: string;
    name: string;
    level: string | null;
  };
  canTeach?: boolean;
}

export default function InstructorQueuePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [enrichedQueueItems, setEnrichedQueueItems] = useState<
    EnrichedQueueItem[]
  >([]);
  // Use WebSocket hook for real-time updates
  // Note: Hook auto-subscribes instructors/admins after USER_IDENTIFIED
  const { isConnected, connectionError, queueItems, reconnect, acceptQueue } =
    useQueueWebSocket(user);

  // Convert queueItems Map to enriched array
  // Server now sends enriched data with student and subject info
  useEffect(() => {
    if (queueItems.size === 0) {
      setEnrichedQueueItems([]);
      return;
    }

    const enrichedItems: EnrichedQueueItem[] = [];

    for (const [cognitoId, item] of queueItems.entries()) {
      // Check if instructor can teach this subject
      const canTeach =
        user?.subjects?.some((s: any) => s.id === item.subjectId) ?? false;

      enrichedItems.push({
        id: item.id || 0,
        description: item.description || "",
        status: item.status || "PENDING",
        createdAt: item.createdAt || new Date().toISOString(),
        studentId: item.studentId || cognitoId,
        subjectId: item.subjectId || "",
        // Server provides enriched student and subject data
        student: item.student || {
          id: cognitoId,
          firstName: "Student",
          lastName: "(Loading...)",
          email: "",
        },
        subject: item.subject || {
          id: item.subjectId || "",
          name: "Unknown Subject",
          level: null,
        },
        canTeach,
      });
    }

    setEnrichedQueueItems(enrichedItems);
    console.log(
      "[Instructor Queue] Enriched queue items:",
      enrichedItems.length,
    );
  }, [queueItems, user?.subjects]);

  const handleAcceptStudent = async (queueItem: EnrichedQueueItem) => {
    setIsLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      console.log(`[Instructor Queue] Accepting queue item: ${queueItem.id}`);

      // Step 1: Create session
      console.log("[Instructor Queue] Creating session...");
      const sessionResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/sessions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: `${queueItem.subject} Session with ${queueItem.student}`,
            description: queueItem.description,
            startTime: Date.now(),
            endTime: new Date(Date.now() + 30 * 60 * 1000),
            students: [queueItem.studentId],
            subjects: [queueItem.subjectId],
          }),
        },
      );

      if (!sessionResponse.ok) {
        notifications.show({
          title: "Error",
          message: "Couldn't generate a session. Try again.",
          color: "red",
          icon: <XCircle size={16} />,
          autoClose: 5000,
        });
        return;
      }

      const sessionData = await sessionResponse.json();
      const sessionId = sessionData.session?.id || sessionData.id;

      if (!sessionId) {
        notifications.show({
          title: "Error",
          message: "Something went wrong. Try again.",
          color: "red",
          icon: <XCircle size={16} />,
          autoClose: 5000,
        });
        return;
      }

      console.log("[Instructor Queue] Session created:", sessionId);

      // Step 2: Call acceptQueue via WebSocket
      console.log(
        "[Instructor Queue] Notifying queue acceptance via WebSocket...",
      );
      acceptQueue(queueItem.studentId, sessionId);

      // Step 3: Redirect to session
      console.log("[Instructor Queue] Redirecting to session:", sessionId);
      router.push(`/sessions/${sessionId}`);
    } catch (error) {
      console.error("[Instructor Queue] Failed to accept student:", error);
      notifications.show({
        title: "Error",
        message: "Failed to accept student. Try again.",
        color: "red",
        icon: <XCircle size={16} />,
        autoClose: 5000,
      });
      return;
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== "INSTRUCTOR") {
    return (
      <Box p="xl">
        <Text>Access denied. This page is for instructors only.</Text>
      </Box>
    );
  }

  return (
    <Box p="xl">
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => router.back()}
        mb="md"
      >
        Back
      </Button>

      <Group justify="space-between" mb="xl">
        <Box>
          <Text size="xl" fw={700}>
            Tutoring Queue
          </Text>
          <Text c="dimmed">Help students by accepting their requests</Text>
        </Box>
        <Group gap="md">
          <Badge size="lg" color="blue" variant="light">
            {enrichedQueueItems.length} students waiting
          </Badge>
          <Group gap="xs">
            {isConnected ? (
              <Tooltip label="Connected to live updates">
                <IconWifi size={20} color="green" />
              </Tooltip>
            ) : (
              <Tooltip label="Connection lost - click to reconnect">
                <ActionIcon variant="subtle" color="red" onClick={reconnect}>
                  <IconWifiOff size={20} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>
      </Group>

      {connectionError && (
        <Alert
          icon={<IconWifiOff size={16} />}
          color="red"
          title="Connection Error"
          mb="md"
        >
          <Group justify="space-between">
            <Text>{connectionError}</Text>
            <Button size="xs" variant="light" onClick={reconnect}>
              <IconRefresh size={14} />
            </Button>
          </Group>
        </Alert>
      )}

      {!isConnected && queueItems.size === 0 ? (
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Center>
            <Stack align="center" gap="md">
              <Loader size="lg" />
              <Text size="lg" c="dimmed">
                Connecting to queue...
              </Text>
            </Stack>
          </Center>
        </Card>
      ) : enrichedQueueItems.length === 0 ? (
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Center>
            <Stack align="center" gap="md">
              <IconUser size={48} color="var(--mantine-color-gray-4)" />
              <Text size="lg" c="dimmed">
                No students in queue
              </Text>
              <Text size="sm" c="dimmed">
                Check back later for new requests
              </Text>
            </Stack>
          </Center>
        </Card>
      ) : (
        <ScrollArea h={600}>
          <Stack gap="md">
            {enrichedQueueItems.map((item) => {
              const canTeach = item.canTeach;

              return (
                <Card
                  key={item.id}
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                >
                  <Group justify="space-between" align="flex-start">
                    <Group gap="md" style={{ flex: 1 }}>
                      <Avatar color="blue" radius="xl">
                        {item.student?.firstName?.[0] || "?"}
                        {item.student?.lastName?.[0] || "?"}
                      </Avatar>

                      <Box style={{ flex: 1 }}>
                        <Text fw={600} size="lg" mb="xs">
                          {item.student?.firstName || "Unknown"}{" "}
                          {item.student?.lastName || "Student"}
                        </Text>

                        <Text size="sm" c="dimmed" mb="xs">
                          {item.student?.email || "No email"}
                        </Text>

                        <Badge color="blue" variant="outline" mb="sm">
                          {item.subject?.name || "Unknown Subject"}
                        </Badge>

                        <Text size="sm" mb="md">
                          {item.description}
                        </Text>

                        {!canTeach && (
                          <Alert
                            icon={<IconAlertTriangle size={16} />}
                            color="orange"
                            variant="light"
                            mb="md"
                          >
                            This subject is outside your expertise. Consider if
                            you can still help.
                          </Alert>
                        )}
                      </Box>
                    </Group>

                    <Group gap="sm">
                      <Tooltip label="Accept and start session">
                        <Button
                          leftSection={<IconCheck size={16} />}
                          onClick={() => handleAcceptStudent(item)}
                          loading={isLoading}
                          color={canTeach ? "green" : "orange"}
                          variant={canTeach ? "filled" : "outline"}
                        >
                          Accept
                        </Button>
                      </Tooltip>
                    </Group>
                  </Group>
                </Card>
              );
            })}
          </Stack>
        </ScrollArea>
      )}
    </Box>
  );
}
