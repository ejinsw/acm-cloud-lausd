"use client";

import { useQueueSSE } from "../../../hooks/useQueueSSE";
import {
  Box,
  Text,
  Card,
  Group,
  Button,
  Badge,
  Stack,
  Notification,
  ActionIcon,
  Tooltip,
  ScrollArea,
  Code,
} from "@mantine/core";
import {
  IconWifi,
  IconWifiOff,
  IconRefresh,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";

export default function QueueTestPage() {
  const instructorSSE = useQueueSSE("INSTRUCTOR");
  const studentSSE = useQueueSSE("STUDENT");

  return (
    <Box p="xl">
      <Text size="xl" fw={700} mb="xl">
        Queue SSE Test Page
      </Text>

      <Stack gap="md">
        {/* Instructor SSE Status */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <IconUsers size={20} />
              <Text fw={600}>Instructor SSE</Text>
            </Group>
            <Group gap="xs">
              {instructorSSE.isConnected ? (
                <Tooltip label="Connected to live updates">
                  <IconWifi size={20} color="green" />
                </Tooltip>
              ) : (
                <Tooltip label="Connection lost - click to reconnect">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={instructorSSE.reconnect}
                  >
                    <IconWifiOff size={20} />
                  </ActionIcon>
                </Tooltip>
              )}
              <Badge color="blue" variant="light">
                {instructorSSE.queueItems.length} students
              </Badge>
            </Group>
          </Group>

          {instructorSSE.connectionError && (
            <Notification
              icon={<IconWifiOff size={16} />}
              color="red"
              title="Connection Error"
              mb="md"
              action={
                <Button
                  size="xs"
                  variant="light"
                  onClick={instructorSSE.reconnect}
                >
                  <IconRefresh size={14} />
                </Button>
              }
            >
              {instructorSSE.connectionError}
            </Notification>
          )}

          <Text size="sm" c="dimmed" mb="sm">
            Queue Items (Real-time):
          </Text>
          <ScrollArea h={200}>
            <Stack gap="xs">
              {instructorSSE.queueItems.length === 0 ? (
                <Text size="sm" c="dimmed">
                  No students in queue
                </Text>
              ) : (
                instructorSSE.queueItems.map((item) => (
                  <Card key={item.id} padding="sm" withBorder>
                    <Group justify="space-between">
                      <Box>
                        <Text fw={500} size="sm">
                          {item.student.firstName} {item.student.lastName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {item.subject.name} - {item.description}
                        </Text>
                      </Box>
                      <Badge
                        color={item.canTeach ? "green" : "orange"}
                        size="sm"
                      >
                        {item.canTeach ? "Can Teach" : "Outside Expertise"}
                      </Badge>
                    </Group>
                  </Card>
                ))
              )}
            </Stack>
          </ScrollArea>
        </Card>

        {/* Student SSE Status */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <IconUser size={20} />
              <Text fw={600}>Student SSE</Text>
            </Group>
            <Group gap="xs">
              {studentSSE.isConnected ? (
                <Tooltip label="Connected to live updates">
                  <IconWifi size={20} color="green" />
                </Tooltip>
              ) : (
                <Tooltip label="Connection lost - click to reconnect">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={studentSSE.reconnect}
                  >
                    <IconWifiOff size={20} />
                  </ActionIcon>
                </Tooltip>
              )}
              <Badge
                color={studentSSE.myQueueStatus?.inQueue ? "green" : "gray"}
                variant="light"
              >
                {studentSSE.myQueueStatus?.inQueue
                  ? "In Queue"
                  : "Not in Queue"}
              </Badge>
            </Group>
          </Group>

          {studentSSE.connectionError && (
            <Notification
              icon={<IconWifiOff size={16} />}
              color="red"
              title="Connection Error"
              mb="md"
              action={
                <Button
                  size="xs"
                  variant="light"
                  onClick={studentSSE.reconnect}
                >
                  <IconRefresh size={14} />
                </Button>
              }
            >
              {studentSSE.connectionError}
            </Notification>
          )}

          <Text size="sm" c="dimmed" mb="sm">
            My Queue Status (Real-time):
          </Text>
          <Code block>{JSON.stringify(studentSSE.myQueueStatus, null, 2)}</Code>
        </Card>

        {/* Instructions */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={600} mb="sm">
            How to Test:
          </Text>
          <Stack gap="xs">
            <Text size="sm">1. Open two browser tabs/windows</Text>
            <Text size="sm">
              2. In one tab: Login as instructor and go to /queue/instructor
            </Text>
            <Text size="sm">
              3. In another tab: Login as student and go to /queue/join
            </Text>
            <Text size="sm">
              4. Student joins queue → Instructor sees real-time update
            </Text>
            <Text size="sm">
              5. Instructor accepts queue → Student sees status update
            </Text>
            <Text size="sm">
              6. Student leaves queue → Instructor sees real-time update
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}
