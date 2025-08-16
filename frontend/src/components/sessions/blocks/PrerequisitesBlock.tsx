import { useState } from "react";
import { Paper, Textarea, Text, Group, ActionIcon, Box } from "@mantine/core";
import { Edit3, Check, X, BookOpen, Trash2 } from "lucide-react";

interface PrerequisitesBlockProps {
  prerequisites: string;
  onUpdate: (prerequisites: string) => void;
  onRemove?: () => void;
  isRemovable?: boolean;
}

export function PrerequisitesBlock({ 
  prerequisites, 
  onUpdate, 
  onRemove, 
  isRemovable = false 
}: PrerequisitesBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempPrerequisites, setTempPrerequisites] = useState(prerequisites);

  const handleSave = () => {
    onUpdate(tempPrerequisites.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempPrerequisites(prerequisites);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Paper p="lg" radius="lg" withBorder bg="teal.0">
        <Group justify="space-between" mb="md">
          <Text size="sm" c="teal" fw={500}>Prerequisites</Text>
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
        
        <Text size="sm" fw={500} mb="xs" c="dimmed">
          What should students already know before joining this session?
        </Text>
        <Textarea
          value={tempPrerequisites}
          onChange={(e) => setTempPrerequisites(e.target.value)}
          placeholder="List the knowledge or skills students need..."
          minRows={3}
          maxRows={6}
        />
      </Paper>
    );
  }

  return (
    <Paper p="lg" radius="lg" withBorder bg="gray.0">
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <BookOpen size={18} color="#20C997" />
          <Text size="sm" c="dimmed" fw={500}>Prerequisites</Text>
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
        {prerequisites ? (
          <Text size="md" c="dark.8">
            {prerequisites}
          </Text>
        ) : (
          <Text size="lg" c="dimmed" fw={500}>
            Click to add prerequisites...
          </Text>
        )}
      </Box>
    </Paper>
  );
}
