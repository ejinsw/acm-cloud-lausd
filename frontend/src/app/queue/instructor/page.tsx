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
} from "@tabler/icons-react";
import { getToken } from "../../../actions/authentication";

export default function InstructorQueuePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);

  // Load queue items on component mount
  useEffect(() => {
    const loadQueueItems = async () => {
      try {
        setLoadingQueue(true);
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
        setQueueItems(data.queueItems || []);
      } catch (error) {
        console.error("Failed to load queue items:", error);
        setQueueItems([]);
      } finally {
        setLoadingQueue(false);
      }
    };
    loadQueueItems();
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

      // Remove the accepted item from the list
      setQueueItems((prev) => prev.filter((item) => item.id !== queueItemId));
      // Note: Live session handling is done elsewhere
      console.log(
        `Accepted queue item ${queueItemId} - session handling by other system`
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
        <Badge size="lg" color="blue" variant="light">
          {queueItems.length} students waiting
        </Badge>
      </Group>

      {loadingQueue ? (
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
