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

export default function InstructorQueuePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [fallbackQueueItems, setFallbackQueueItems] = useState<any[]>([]);
  
  // Check Zoom connection status
  const { connected: zoomConnected, expired: zoomExpired, isLoading: zoomLoading } = useZoomStatus();

  // Use WebSocket hook for real-time updates
  const { isConnected, connectionError, queueItems, reconnect } =
    useQueueWebSocket("INSTRUCTOR");

  // Use WebSocket queue items if available, otherwise fall back to API-loaded items
  const displayQueueItems = queueItems.length > 0 ? queueItems : fallbackQueueItems;

  // Log WebSocket queue updates
  useEffect(() => {
    console.log("Queue items updated via WebSocket:", queueItems.length, "items");
    if (queueItems.length > 0) {
      console.log("Current queue items:", queueItems);
    }
  }, [queueItems]);

  // Session creation redirect is handled by the accept queue API response

  // Load initial queue items on component mount
  useEffect(() => {
    const loadInitialQueueItems = async () => {
      try {
        const token = await getToken();
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
          }/api/queue`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch queue items");
        }

        const data = await response.json();
        console.log("Initial queue API response:", data);
        console.log(
          "Initial queue loaded:",
          data.queueItems?.length || 0,
          "items"
        );
        
        // Set fallback queue items if SSE hasn't loaded them yet
        if (data.queueItems && data.queueItems.length > 0) {
          setFallbackQueueItems(data.queueItems);
          console.log("Fallback queue items set:", data.queueItems.length, "items");
        }
      } catch (error) {
        console.error("Failed to load initial queue items:", error);
      } finally {
        setInitialLoadComplete(true);
      }
    };

    loadInitialQueueItems();
  }, []);

  const handleAcceptStudent = async (queueItemId: number) => {
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

      console.log(`Accepting queue item: ${queueItemId}`);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/queue/${queueItemId}/accept`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Accept response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Accept request failed:", errorData);
        
        // Handle Zoom connection error specifically
        if (errorData.needsZoomConnection) {
          alert(`${errorData.message}\n\nYou will be redirected to connect your Zoom account.`);
          router.push('/dashboard/instructor?tab=zoom');
          return;
        }
        
        throw new Error(
          errorData.message || `Failed to accept student (${response.status})`
        );
      }

      const result = await response.json();
      console.log("Accept request successful:", result);

      // Check if session was created and redirect immediately
      if (result.session && result.redirectUrl) {
        console.log("Session created, redirecting to:", result.redirectUrl);
        router.push(result.redirectUrl);
      } else {
        // Note: SSE will automatically update the queue list
        // No need to manually update state - SSE handles it
        console.log(
          `Accepted queue item ${queueItemId} - SSE will update the list`
        );
      }
    } catch (error) {
      console.error("Failed to accept student:", error);
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
            {displayQueueItems.length} students waiting
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
          action={
            <Button size="xs" variant="light" onClick={reconnect}>
              <IconRefresh size={14} />
            </Button>
          }
        >
          {connectionError}
        </Alert>
      )}

      {/* Zoom Connection Warning */}
      {!zoomLoading && (!zoomConnected || zoomExpired) && (
        <Alert
          icon={<IconVideo size={16} />}
          color="yellow"
          title="Zoom Account Required"
          mb="md"
          action={
            <Button 
              size="xs" 
              variant="light" 
              onClick={() => router.push('/dashboard/instructor?tab=zoom')}
            >
              Connect Zoom
            </Button>
          }
        >
          {zoomExpired 
            ? "Your Zoom connection has expired. Please reconnect to accept queue requests and create sessions."
            : "You must connect your Zoom account before accepting queue requests. Zoom meetings are automatically created for all sessions."
          }
        </Alert>
      )}

      {!initialLoadComplete ? (
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Center>
            <Stack align="center" gap="md">
              <Loader size="lg" />
              <Text size="lg" c="dimmed">
                Loading queue...
              </Text>
            </Stack>
          </Center>
        </Card>
      ) : displayQueueItems.length === 0 ? (
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
            {displayQueueItems.map((item) => {
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
                        {item.student.firstName[0]}
                        {item.student.lastName[0]}
                      </Avatar>

                      <Box style={{ flex: 1 }}>
                        <Text fw={600} size="lg" mb="xs">
                          {item.student.firstName} {item.student.lastName}
                        </Text>

                        <Text size="sm" c="dimmed" mb="xs">
                          {item.student.email}
                        </Text>

                        <Badge color="blue" variant="outline" mb="sm">
                          {item.subject.name}
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
                          onClick={() => handleAcceptStudent(item.id)}
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
