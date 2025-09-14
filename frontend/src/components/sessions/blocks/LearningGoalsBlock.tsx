import { useState } from "react";
import { Paper, TextInput, Text, Group, ActionIcon, Box, Button, Stack, Chip } from "@mantine/core";
import { Edit3, Check, X, Target, Plus, Trash2 } from "lucide-react";

interface LearningGoalsBlockProps {
  objectives: string[];
  onUpdate: (objectives: string[]) => void;
  onRemove?: () => void;
  isRemovable?: boolean;
}

export function LearningGoalsBlock({ 
  objectives, 
  onUpdate, 
  onRemove, 
  isRemovable = false 
}: LearningGoalsBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempObjectives, setTempObjectives] = useState<string[]>(objectives);
  const [newObjective, setNewObjective] = useState("");

  const handleSave = () => {
    onUpdate(tempObjectives.filter(objective => objective.trim()));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempObjectives(objectives);
    setNewObjective("");
    setIsEditing(false);
  };

  const addObjective = () => {
    if (newObjective.trim() && !tempObjectives.includes(newObjective.trim())) {
      setTempObjectives([...tempObjectives, newObjective.trim()]);
      setNewObjective("");
    }
  };

  const removeObjective = (index: number) => {
    setTempObjectives(tempObjectives.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addObjective();
    }
  };

  if (isEditing) {
    return (
      <Paper p="lg" radius="lg" withBorder bg="orange.0">
        <Group justify="space-between" mb="md">
          <Text size="sm" c="orange" fw={500}>Learning Objectives</Text>
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
            What will students be able to do after this session?
          </Text>
          <Group gap="xs">
            <TextInput
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              placeholder="Add a learning objective..."
              style={{ flex: 1 }}
              onKeyDown={handleKeyDown}
            />
            <Button 
              variant="light" 
              size="sm" 
              onClick={addObjective}
              leftSection={<Plus size={14} />}
            >
              Add
            </Button>
          </Group>
        </Box>
        
        {tempObjectives.length > 0 && (
          <Stack gap="xs">
            <Text size="sm" fw={500} c="dimmed">Current Objectives:</Text>
            {tempObjectives.map((objective, index) => (
              <Group key={index} gap="xs">
                <Chip 
                  variant="light" 
                  color="orange" 
                  style={{ flex: 1 }}
                >
                  {objective}
                </Chip>
                <ActionIcon 
                  variant="subtle" 
                  color="red" 
                  size="sm"
                  onClick={() => removeObjective(index)}
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
          <Target size={18} color="#FD7E14" />
          <Text size="sm" c="dimmed" fw={500}>Learning Objectives</Text>
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
        {objectives.length > 0 ? (
          <Stack gap="xs">
            {objectives.map((objective, index) => (
              <Chip 
                key={index} 
                variant="light" 
                color="orange"
                size="md"
                checked={false}
                readOnly
              >
                {objective}
              </Chip>
            ))}
          </Stack>
        ) : (
          <Text size="lg" c="dimmed" fw={500}>
            Click to add learning objectives...
          </Text>
        )}
      </Box>
    </Paper>
  );
}
