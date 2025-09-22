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
  Notification,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconUser,
  IconAlertTriangle,
  IconCheck,
  IconWifi,
  IconWifiOff,
  IconRefresh,
} from "@tabler/icons-react";
import { getToken } from "../../../actions/authentication";
import { useQueueSSE } from "../../../hooks/useQueueSSE";

export default function InstructorQueuePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Use SSE hook for real-time updates
  const { isConnected, connectionError, queueItems, reconnect } =
    useQueueSSE("INSTRUCTOR");

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
        // Note: SSE will handle updates after initial load
        console.log(
          "Initial queue loaded:",
          data.queueItems?.length || 0,
          "items"
        );
      } catch (error) {
        console.error("Failed to load initial queue items:", error);
      } finally {
        setInitialLoadComplete(true);
      }
    };

    loadInitialQueueItems();
  }, []);

  const handleAcceptStudent = async (queueItemId: number) => {
    setIsLoading(true);

    try {
      const token = await getToken();
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

      if (!response.ok) {
        throw new Error("Failed to accept student");
      }

      // Note: SSE will automatically update the queue list
      // No need to manually update state - SSE handles it
      console.log(
        `Accepted queue item ${queueItemId} - SSE will update the list`
      );
    } catch (error) {
      console.error("Failed to accept student:", error);
      // Handle error - show notification or alert
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
            {queueItems.length} students waiting
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
      ) : queueItems.length === 0 ? (
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
            {queueItems.map((item) => {
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
