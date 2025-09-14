import { useState } from "react";
import { Paper, TextInput, Text, Group, ActionIcon, Box, Button, Stack, Chip } from "@mantine/core";
import { Edit3, Check, X, Upload, Plus, Trash2 } from "lucide-react";

interface MaterialsBlockProps {
  materials: string[];
  onUpdate: (materials: string[]) => void;
  onRemove?: () => void;
  isRemovable?: boolean;
}

export function MaterialsBlock({ 
  materials, 
  onUpdate, 
  onRemove, 
  isRemovable = false 
}: MaterialsBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempMaterials, setTempMaterials] = useState<string[]>(materials);
  const [newMaterial, setNewMaterial] = useState("");

  const handleSave = () => {
    onUpdate(tempMaterials.filter(material => material.trim()));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempMaterials(materials);
    setNewMaterial("");
    setIsEditing(false);
  };

  const addMaterial = () => {
    if (newMaterial.trim() && !tempMaterials.includes(newMaterial.trim())) {
      setTempMaterials([...tempMaterials, newMaterial.trim()]);
      setNewMaterial("");
    }
  };

  const removeMaterial = (index: number) => {
    setTempMaterials(tempMaterials.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addMaterial();
    }
  };

  if (isEditing) {
    return (
      <Paper p="lg" radius="lg" withBorder bg="cyan.0">
        <Group justify="space-between" mb="md">
          <Text size="sm" c="cyan" fw={500}>Materials & Resources</Text>
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
            What materials or equipment will students need?
          </Text>
          <Group gap="xs">
            <TextInput
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              placeholder="Add a material..."
              style={{ flex: 1 }}
              onKeyDown={handleKeyDown}
            />
            <Button 
              variant="light" 
              size="sm" 
              onClick={addMaterial}
              leftSection={<Plus size={14} />}
            >
              Add
            </Button>
          </Group>
        </Box>
        
        {tempMaterials.length > 0 && (
          <Stack gap="xs">
            <Text size="sm" fw={500} c="dimmed">Current Materials:</Text>
            {tempMaterials.map((material, index) => (
              <Group key={index} gap="xs">
                <Chip 
                  variant="light" 
                  color="cyan" 
                  style={{ flex: 1 }}
                >
                  {material}
                </Chip>
                <ActionIcon 
                  variant="subtle" 
                  color="red" 
                  size="sm"
                  onClick={() => removeMaterial(index)}
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
          <Upload size={18} color="#15AABF" />
          <Text size="sm" c="dimmed" fw={500}>Materials & Resources</Text>
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
        {materials.length > 0 ? (
          <Stack gap="xs">
            {materials.map((material, index) => (
              <Chip 
                key={index} 
                variant="light" 
                color="cyan"
                size="md"
                checked={false}
                readOnly
              >
                {material}
              </Chip>
            ))}
          </Stack>
        ) : (
          <Text size="lg" c="dimmed" fw={500}>
            Click to add materials...
          </Text>
        )}
      </Box>
    </Paper>
  );
}
