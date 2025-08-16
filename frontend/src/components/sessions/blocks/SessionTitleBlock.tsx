import { useState } from "react";
import { Paper, TextInput, Text, Group, ActionIcon, Box, Button } from "@mantine/core";
import { Edit3, Check, X, BookOpen, Trash2 } from "lucide-react";

interface SessionTitleBlockProps {
  name: string;
  onUpdate: (name: string) => void;
  onRemove?: () => void;
  isRemovable?: boolean;
}

export function SessionTitleBlock({ name, onUpdate, onRemove, isRemovable = false }: SessionTitleBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);

  const handleSave = () => {
    if (tempName.trim()) {
      onUpdate(tempName.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempName(name);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Paper p="lg" radius="lg" withBorder bg="blue.0">
        <Group justify="space-between" mb="md">
          <Text size="sm" c="blue" fw={500}>Session Name</Text>
          <Group gap="xs">
            <ActionIcon 
              variant="light" 
              color="green" 
              size="sm"
              onClick={handleSave}
            >
              <Check size={16} />
            </ActionIcon>
            <ActionIcon 
              variant="light" 
              color="red" 
              size="sm"
              onClick={handleCancel}
            >
              <X size={16} />
            </ActionIcon>
          </Group>
        </Group>
        <TextInput
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          placeholder="Enter your session name..."
          size="lg"
          fw={600}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
        />
      </Paper>
    );
  }

  return (
    <Paper p="lg" radius="lg" withBorder bg="gray.0">
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <BookOpen size={18} color="#228BE6" />
          <Text size="sm" c="dimmed" fw={500}>Session Name</Text>
        </Group>
        <Group gap="xs">
          <ActionIcon 
            variant="subtle" 
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit3 size={16} />
          </ActionIcon>
          {isRemovable && onRemove && (
            <ActionIcon 
              variant="subtle" 
              color="red" 
              size="sm"
              onClick={onRemove}
            >
              <Trash2 size={16} />
            </ActionIcon>
          )}
        </Group>
      </Group>
      
      <Box>
        {name ? (
          <Text size="xl" fw={700} c="dark.8">
            {name}
          </Text>
        ) : (
          <Text size="lg" c="dimmed" fw={500}>
            Click to add your session name...
          </Text>
        )}
      </Box>
    </Paper>
  );
}
