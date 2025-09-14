import { useState } from "react";
import { Paper, Textarea, Text, Group, ActionIcon, Box } from "@mantine/core";
import { Edit3, Check, X, FileText, Trash2 } from "lucide-react";

interface DescriptionBlockProps {
  description: string;
  onUpdate: (description: string) => void;
  onRemove?: () => void;
  isRemovable?: boolean;
}

export function DescriptionBlock({ 
  description, 
  onUpdate, 
  onRemove, 
  isRemovable = false 
}: DescriptionBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempDescription, setTempDescription] = useState(description);

  const handleSave = () => {
    onUpdate(tempDescription.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempDescription(description);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Paper p="lg" radius="lg" withBorder bg="violet.0">
        <Group justify="space-between" mb="md">
          <Text size="sm" c="violet" fw={500}>Session Description</Text>
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
        
        <Box>
          <Text size="sm" fw={500} mb="xs" c="dimmed">
            <FileText size={14} style={{ display: 'inline', marginRight: 5 }} />
            Describe what students will learn in this session
          </Text>
          <Textarea
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
            placeholder="Comprehensive description of what students will learn..."
            minRows={4}
            maxRows={8}
          />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper p="lg" radius="lg" withBorder bg="gray.0">
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <FileText size={18} color="#7950F2" />
          <Text size="sm" c="dimmed" fw={500}>Session Description</Text>
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
        {description ? (
          <Text size="md" c="dark.8">
            {description}
          </Text>
        ) : (
          <Text size="lg" c="dimmed" fw={500}>
            Click to add description...
          </Text>
        )}
      </Box>
    </Paper>
  );
}
