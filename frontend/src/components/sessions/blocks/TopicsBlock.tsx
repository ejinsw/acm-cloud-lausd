import { useState } from "react";
import { Paper, TextInput, Text, Group, ActionIcon, Box, Button, Stack, Chip } from "@mantine/core";
import { Edit3, Check, X, Tag, Plus, Trash2 } from "lucide-react";

interface TopicsBlockProps {
  topics: string[];
  onUpdate: (topics: string[]) => void;
  onRemove?: () => void;
  isRemovable?: boolean;
}

export function TopicsBlock({ 
  topics, 
  onUpdate, 
  onRemove, 
  isRemovable = false 
}: TopicsBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTopics, setTempTopics] = useState<string[]>(topics);
  const [newTopic, setNewTopic] = useState("");

  const handleSave = () => {
    onUpdate(tempTopics.filter(topic => topic.trim()));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempTopics(topics);
    setNewTopic("");
    setIsEditing(false);
  };

  const addTopic = () => {
    if (newTopic.trim() && !tempTopics.includes(newTopic.trim())) {
      setTempTopics([...tempTopics, newTopic.trim()]);
      setNewTopic("");
    }
  };

  const removeTopic = (index: number) => {
    setTempTopics(tempTopics.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTopic();
    }
  };

  if (isEditing) {
    return (
      <Paper p="lg" radius="lg" withBorder bg="grape.0">
        <Group justify="space-between" mb="md">
          <Text size="sm" c="grape" fw={500}>Topics Covered</Text>
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
            What specific topics will be covered in this session?
          </Text>
          <Group gap="xs">
            <TextInput
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Add a topic..."
              style={{ flex: 1 }}
              onKeyDown={handleKeyDown}
            />
            <Button 
              variant="light" 
              size="sm" 
              onClick={addTopic}
              leftSection={<Plus size={14} />}
            >
              Add
            </Button>
          </Group>
        </Box>
        
        {tempTopics.length > 0 && (
          <Stack gap="xs">
            <Text size="sm" fw={500} c="dimmed">Current Topics:</Text>
            {tempTopics.map((topic, index) => (
              <Group key={index} gap="xs">
                <Chip 
                  variant="light" 
                  color="grape" 
                  style={{ flex: 1 }}
                >
                  {topic}
                </Chip>
                <ActionIcon 
                  variant="subtle" 
                  color="red" 
                  size="sm"
                  onClick={() => removeTopic(index)}
                >
                  <Trash2 size={14} />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
        )}
      </Paper>
    );
  }

  return (
    <Paper p="lg" radius="lg" withBorder bg="gray.0">
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <Tag size={18} color="#BE4BDB" />
          <Text size="sm" c="dimmed" fw={500}>Topics Covered</Text>
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
        {topics.length > 0 ? (
          <Stack gap="xs">
            {topics.map((topic, index) => (
              <Chip 
                key={index} 
                variant="light" 
                color="grape"
                size="md"
                checked={false}
                readOnly
              >
                {topic}
              </Chip>
            ))}
          </Stack>
        ) : (
          <Text size="lg" c="dimmed" fw={500}>
            Click to add topics...
          </Text>
        )}
      </Box>
    </Paper>
  );
}
