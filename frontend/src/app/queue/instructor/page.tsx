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
  const [enrichedQueueItems, setEnrichedQueueItems] = useState<EnrichedQueueItem[]>([]);
  
  // Check Zoom connection status
  const { connected: zoomConnected, expired: zoomExpired, isLoading: zoomLoading } = useZoomStatus();

  // Use WebSocket hook for real-time updates
  const { isConnected, connectionError, queueItems, reconnect, subscribeQueue, acceptQueue } =
    useQueueWebSocket(user);

  // Subscribe to queue on mount and when reconnecting
  useEffect(() => {
    if (isConnected && user?.role === "INSTRUCTOR") {
      console.log("[Instructor Queue] Subscribing to queue as instructor");
      subscribeQueue("instructor");
    }
  }, [isConnected, subscribeQueue, user?.role]);

  // Enrich queue items with subject and student data from API
  useEffect(() => {
    const enrichQueueItems = async () => {
      if (queueItems.size === 0) {
        setEnrichedQueueItems([]);
        return;
      }

      try {
        const token = await getToken();
        const enrichedItems: EnrichedQueueItem[] = [];

        for (const [id, item] of queueItems.entries()) {
          // Fetch subject data
          const subjectResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/subjects/${item.subjectId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          // Fetch student data
          const studentResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/users/${item.studentId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          const subject = subjectResponse.ok ? await subjectResponse.json() : null;
          const student = studentResponse.ok ? await studentResponse.json() : null;

          // Check if instructor can teach this subject
          const canTeach = user?.subjects?.some((s: any) => s.id === item.subjectId) ?? false;

          enrichedItems.push({
            id: item.id || 0,
            description: item.description,
            status: item.status || "PENDING",
            createdAt: item.createdAt || new Date().toISOString(),
            studentId: item.studentId || "",
            subjectId: item.subjectId || "",
            subject,
            student,
            canTeach,
          });
        }

        setEnrichedQueueItems(enrichedItems);
        console.log("[Instructor Queue] Enriched queue items:", enrichedItems);
      } catch (error) {
        console.error("[Instructor Queue] Failed to enrich queue items:", error);
      }
    };

    enrichQueueItems();
  }, [queueItems, user?.subjects]);


  const handleAcceptStudent = async (queueItem: EnrichedQueueItem) => {
    // Check Zoom connection before accepting
    if (!zoomConnected || zoomExpired) {
      alert("You must connect your Zoom account before accepting queue requests.\n\nYou will be redirected to connect your Zoom account.");
      router.push('/dashboard/instructor?tab=zoom');
      return;
    }

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
            studentId: queueItem.studentId,
            subjectId: queueItem.subjectId,
            queueId: queueItem.id,
          }),
        }
      );

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json().catch(() => ({}));
        console.error("[Instructor Queue] Session creation failed:", errorData);
        
        // Handle Zoom connection error specifically
        if (errorData.needsZoomConnection) {
          alert(`${errorData.message}\n\nYou will be redirected to connect your Zoom account.`);
          router.push('/dashboard/instructor?tab=zoom');
          return;
        }
        
        throw new Error(
          errorData.message || `Failed to create session (${sessionResponse.status})`
        );
      }

      const sessionData = await sessionResponse.json();
      const sessionId = sessionData.session?.id || sessionData.id;
      
      if (!sessionId) {
        throw new Error("Session created but no session ID returned");
      }

      console.log("[Instructor Queue] Session created:", sessionId);

      // Step 2: Call acceptQueue via WebSocket
      console.log("[Instructor Queue] Notifying queue acceptance via WebSocket...");
      acceptQueue(queueItem.studentId, sessionId);

      // Step 3: Redirect to session
      console.log("[Instructor Queue] Redirecting to session:", sessionId);
      router.push(`/sessions/${sessionId}`);
      
    } catch (error) {
      console.error("[Instructor Queue] Failed to accept student:", error);
      alert(
        `Failed to accept student: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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
                <ActionIcon variant="subtle" color="red" onClick={() => {
                  reconnect();
                  if (user?.role === "INSTRUCTOR") {
                    subscribeQueue("instructor");
                  }
                }}>
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
            <Button size="xs" variant="light" onClick={() => {
              reconnect();
              if (user?.role === "INSTRUCTOR") {
                subscribeQueue("instructor");
              }
            }}>
              <IconRefresh size={14} />
            </Button>
          </Group>
        </Alert>
      )}

      {/* Zoom Connection Warning */}
      {!zoomLoading && (!zoomConnected || zoomExpired) && (
        <Alert
          icon={<IconVideo size={16} />}
          color="yellow"
          title="Zoom Account Required"
          mb="md"
        >
          <Group justify="space-between">
            <Text>
              {zoomExpired 
                ? "Your Zoom connection has expired. Please reconnect to accept queue requests and create sessions."
                : "You must connect your Zoom account before accepting queue requests. Zoom meetings are automatically created for all sessions."
              }
            </Text>
            <Button 
              size="xs" 
              variant="light" 
              onClick={() => router.push('/dashboard/instructor?tab=zoom')}
            >
              Connect Zoom
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
                          {item.student?.firstName || "Unknown"} {item.student?.lastName || "Student"}
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
