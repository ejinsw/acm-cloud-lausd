import { useState } from "react";
import { Paper, TextInput, Text, Group, ActionIcon, Box, Button, Stack, Chip } from "@mantine/core";
import { Edit3, Check, X, Tag, Plus, Trash2 } from "lucide-react";

interface TagsBlockProps {
  tags: string[];
  onUpdate: (tags: string[]) => void;
  onRemove?: () => void;
  isRemovable?: boolean;
}

export function TagsBlock({ 
  tags, 
  onUpdate, 
  onRemove, 
  isRemovable = false 
}: TagsBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTags, setTempTags] = useState<string[]>(tags);
  const [newTag, setNewTag] = useState("");

  const handleSave = () => {
    onUpdate(tempTags.filter(tag => tag.trim()));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempTags(tags);
    setNewTag("");
    setIsEditing(false);
  };

  const addTag = () => {
    if (newTag.trim() && !tempTags.includes(newTag.trim())) {
      setTempTags([...tempTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    setTempTags(tempTags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTag();
    }
  };

  if (isEditing) {
    return (
      <Paper p="lg" radius="lg" withBorder bg="lime.0">
        <Group justify="space-between" mb="md">
          <Text size="sm" c="lime" fw={500}>Session Tags</Text>
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
        
        <Box mb="md">
          <Text size="sm" fw={500} mb="xs" c="dimmed">
            Add keywords to help students find your session
          </Text>
          <Group gap="xs">
            <TextInput
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              style={{ flex: 1 }}
              onKeyDown={handleKeyDown}
            />
            <Button 
              variant="light" 
              size="sm" 
              onClick={addTag}
              leftSection={<Plus size={14} />}
            >
              Add
            </Button>
          </Group>
        </Box>
        
        {tempTags.length > 0 && (
          <Stack gap="xs">
            <Text size="sm" fw={500} c="dimmed">Current Tags:</Text>
            <Group gap="xs" wrap="wrap">
              {tempTags.map((tag, index) => (
                <Chip 
                  key={index} 
                  variant="light" 
                  color="lime"
                  size="sm"
                  rightSection={
                    <ActionIcon 
                      variant="subtle" 
                      color="red" 
                      size="xs"
                      onClick={() => removeTag(index)}
                    >
                      <Trash2 size={12} />
                    </ActionIcon>
                  }
                >
                  {tag}
                </Chip>
              ))}
            </Group>
          </Stack>
        )}
      </Paper>
    );
  }

  return (
    <Paper p="lg" radius="lg" withBorder bg="gray.0">
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <Tag size={18} color="#82C91E" />
          <Text size="sm" c="dimmed" fw={500}>Session Tags</Text>
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
        {tags.length > 0 ? (
          <Group gap="xs" wrap="wrap">
            {tags.map((tag, index) => (
              <Chip 
                key={index} 
                variant="light" 
                color="lime"
                size="sm"
                checked={false}
                readOnly
              >
                {tag}
              </Chip>
            ))}
          </Group>
        ) : (
          <Text size="lg" c="dimmed" fw={500}>
            Click to add tags...
          </Text>
        )}
      </Box>
    </Paper>
  );
}
