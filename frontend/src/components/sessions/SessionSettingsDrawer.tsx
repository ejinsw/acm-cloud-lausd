"use client";

import { useState, useEffect } from "react";
import {
  Drawer,
  Stack,
  TextInput,
  Textarea,
  NumberInput,
  Button,
  Group,
  Text,
  ActionIcon,
  Box,
  Divider,
  MultiSelect,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { Session } from "@/lib/types";
import { getToken } from "@/actions/authentication";

interface SessionSettingsDrawerProps {
  opened: boolean;
  onClose: () => void;
  session: Session;
  onSessionUpdated: () => void;
}

export default function SessionSettingsDrawer({
  opened,
  onClose,
  session,
  onSessionUpdated,
}: SessionSettingsDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: session.name || "",
    description: session.description || "",
    maxAttendees: session.maxAttendees || 10,
    endTime: session.endTime ? new Date(session.endTime) : null,
    objectives: session.objectives || [],
    materials: session.materials || [],
  });

  const [newObjective, setNewObjective] = useState("");
  const [newMaterial, setNewMaterial] = useState("");

  useEffect(() => {
    if (opened) {
      setFormData({
        name: session.name || "",
        description: session.description || "",
        maxAttendees: session.maxAttendees || 10,
        endTime: session.endTime ? new Date(session.endTime) : null,
        objectives: session.objectives || [],
        materials: session.materials || [],
      });
    }
  }, [opened, session]);

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setFormData((prev) => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()],
      }));
      setNewObjective("");
    }
  };

  const handleRemoveObjective = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  const handleAddMaterial = () => {
    if (newMaterial.trim()) {
      setFormData((prev) => ({
        ...prev,
        materials: [...prev.materials, newMaterial.trim()],
      }));
      setNewMaterial("");
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${session.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            maxAttendees: formData.maxAttendees,
            endTime: formData.endTime?.toISOString(),
            objectives: formData.objectives,
            materials: formData.materials,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update session");
      }

      notifications.show({
        title: "Success",
        message: "Session settings updated successfully",
        color: "green",
      });

      onSessionUpdated();
      onClose();
    } catch (error) {
      console.error("Failed to update session:", error);
      notifications.show({
        title: "Error",
        message: "Failed to update session settings",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Session Settings"
      position="right"
      size="lg"
      padding="lg"
    >
      <Stack gap="md">
        <TextInput
          label="Session Name"
          placeholder="Enter session name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          required
        />

        <Textarea
          label="Description"
          placeholder="Describe this session"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          minRows={3}
        />

        <NumberInput
          label="Max Attendees"
          placeholder="Maximum number of attendees"
          value={formData.maxAttendees}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, maxAttendees: value as number }))
          }
          min={1}
          max={100}
        />

        <DateTimePicker
          label="End Time"
          placeholder="Select end time"
          value={formData.endTime}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, endTime: value }))
          }
          clearable
        />

        <Divider />

        <Box>
          <Text size="sm" fw={500} mb="xs">
            Learning Objectives
          </Text>
          <Stack gap="xs">
            {formData.objectives.map((objective, index) => (
              <Group key={index} gap="xs" wrap="nowrap">
                <Text size="sm" style={{ flex: 1 }}>
                  {objective}
                </Text>
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => handleRemoveObjective(index)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ))}
            <Group gap="xs" wrap="nowrap">
              <TextInput
                placeholder="Add new objective"
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddObjective();
                  }
                }}
                style={{ flex: 1 }}
              />
              <ActionIcon
                color="blue"
                variant="filled"
                onClick={handleAddObjective}
                disabled={!newObjective.trim()}
              >
                <IconPlus size={16} />
              </ActionIcon>
            </Group>
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Text size="sm" fw={500} mb="xs">
            Session Materials
          </Text>
          <Stack gap="xs">
            {formData.materials.map((material, index) => (
              <Group key={index} gap="xs" wrap="nowrap">
                <Text size="sm" style={{ flex: 1 }}>
                  {material}
                </Text>
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => handleRemoveMaterial(index)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ))}
            <Group gap="xs" wrap="nowrap">
              <TextInput
                placeholder="Add material (URL or description)"
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMaterial();
                  }
                }}
                style={{ flex: 1 }}
              />
              <ActionIcon
                color="blue"
                variant="filled"
                onClick={handleAddMaterial}
                disabled={!newMaterial.trim()}
              >
                <IconPlus size={16} />
              </ActionIcon>
            </Group>
          </Stack>
        </Box>

        <Group justify="flex-end" mt="xl">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={loading}>
            Save Changes
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
