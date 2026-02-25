"use client";

import { useState } from "react";
import {
  Paper,
  Stack,
  Title,
  Text,
  Button,
  Group,
  Badge,
  ActionIcon,
  Tooltip,
  Modal,
  Textarea,
  Divider,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconTrash,
  IconEdit,
  IconUserX,
  IconDoorExit,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { RoomMessage, RoomUser } from "@/hooks/useSessionWebSocket";
import { getToken } from "@/actions/authentication";

interface SessionAdminControlsProps {
  sessionId: string;
  currentUserId: string;
  messages: RoomMessage[];
  participants: RoomUser[];
  onDeleteMessage: (messageId: string) => void;
  onKickUser: (userId: string) => void;
  onSessionUpdated: () => void;
  /** Notify the room via WebSocket that the meeting has ended (so all clients redirect and create history). */
  onNotifySessionEnded?: (sessionId: string) => void;
}

export default function SessionAdminControls({
  sessionId,
  currentUserId,
  messages,
  participants,
  onDeleteMessage,
  onKickUser,
  onSessionUpdated,
  onNotifySessionEnded,
}: SessionAdminControlsProps) {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");
  const [endModalOpened, { open: openEndModal, close: closeEndModal }] =
    useDisclosure(false);
  const [loading, setLoading] = useState(false);

  const handleEditMessage = async (messageId: string) => {
    if (!editedText.trim()) {
      notifications.show({
        title: "Error",
        message: "Message cannot be empty",
        color: "red",
      });
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${sessionId}/messages/${messageId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: editedText }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to edit message");
      }

      notifications.show({
        title: "Success",
        message: "Message edited successfully",
        color: "green",
      });

      setEditingMessageId(null);
      setEditedText("");
      onSessionUpdated();
    } catch (error) {
      console.error("Failed to edit message:", error);
      notifications.show({
        title: "Error",
        message: "Failed to edit message",
        color: "red",
      });
    }
  };

  const handleEndSession = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        notifications.show({
          title: "Error",
          message: "Authentication required",
          color: "red",
        });
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${sessionId}/stop`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to end session");
      }

      notifications.show({
        title: "Session Ended",
        message: "The session has been ended successfully",
        color: "green",
      });

      closeEndModal();
      // Notify all participants via WebSocket so they redirect and create history
      onNotifySessionEnded?.(sessionId);
      onSessionUpdated();
    } catch (error) {
      console.error("Failed to end session:", error);
      notifications.show({
        title: "Error",
        message: "Failed to end session",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper p="md" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={4}>Admin Controls</Title>
          <Badge color="orange" variant="light">
            Instructor
          </Badge>
        </Group>

        <Divider />

        <Stack gap="xs">
          <Text size="sm" fw={600}>
            Session Actions
          </Text>
          <Button
            leftSection={<IconDoorExit size={16} />}
            color="red"
            variant="light"
            fullWidth
            onClick={openEndModal}
          >
            End Session
          </Button>
        </Stack>

        <Divider />

        <Stack gap="xs">
          <Text size="sm" fw={600}>
            Participants ({participants.length})
          </Text>
          <Stack gap="xs">
            {participants
              .filter((p) => p.id !== currentUserId)
              .map((participant) => (
                <Group key={participant.id} justify="space-between">
                  <Box style={{ flex: 1 }}>
                    <Text size="sm">{participant.username}</Text>
                    <Text size="xs" c="dimmed">
                      {participant.type.toUpperCase()}
                    </Text>
                  </Box>
                  <Tooltip label="Kick user">
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => onKickUser(participant.id)}
                    >
                      <IconUserX size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              ))}
            {participants.filter((p) => p.id !== currentUserId).length === 0 && (
              <Text size="sm" c="dimmed" ta="center">
                No other participants
              </Text>
            )}
          </Stack>
        </Stack>

        <Divider />

        <Stack gap="xs">
          <Text size="sm" fw={600}>
            Recent Messages
          </Text>
          <Stack gap="xs">
            {messages.slice(-5).map((message) => (
              <Paper key={message.id} p="xs" withBorder>
                {editingMessageId === message.id ? (
                  <Stack gap="xs">
                    <Textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      minRows={2}
                      autoFocus
                    />
                    <Group gap="xs">
                      <Button
                        size="xs"
                        onClick={() => handleEditMessage(message.id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="xs"
                        variant="subtle"
                        onClick={() => {
                          setEditingMessageId(null);
                          setEditedText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </Group>
                  </Stack>
                ) : (
                  <>
                    <Group justify="space-between" mb={4}>
                      <Text size="xs" fw={500}>
                        {message.sender.username}
                      </Text>
                      <Group gap="xs">
                        <Tooltip label="Edit message">
                          <ActionIcon
                            size="xs"
                            variant="subtle"
                            onClick={() => {
                              setEditingMessageId(message.id);
                              setEditedText(message.text);
                            }}
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete message">
                          <ActionIcon
                            size="xs"
                            color="red"
                            variant="subtle"
                            onClick={() => onDeleteMessage(message.id)}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Group>
                    <Text size="sm">{message.text}</Text>
                  </>
                )}
              </Paper>
            ))}
            {messages.length === 0 && (
              <Text size="sm" c="dimmed" ta="center">
                No messages yet
              </Text>
            )}
          </Stack>
        </Stack>
      </Stack>

      <Modal
        opened={endModalOpened}
        onClose={closeEndModal}
        title={
          <Group gap="xs">
            <IconAlertTriangle size={20} color="orange" />
            <Text fw={600}>End Session</Text>
          </Group>
        }
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to end this session? All participants will be
            disconnected and the session will be marked as completed.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeEndModal} disabled={loading}>
              Cancel
            </Button>
            <Button color="red" onClick={handleEndSession} loading={loading}>
              End Session
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}
