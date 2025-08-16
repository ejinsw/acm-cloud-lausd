import { useState, useEffect } from "react";
import { Paper, Select, Text, Group, ActionIcon, Box, Chip, Loader } from "@mantine/core";
import { Edit3, Check, X, GraduationCap, Trash2 } from "lucide-react";

interface SubjectAndLevelBlockProps {
  subject: string;
  level: string;
  onUpdate: (subject: string, level: string) => void;
  onRemove?: () => void;
  isRemovable?: boolean;
}

interface Subject {
  id: string;
  name: string;
  description?: string;
  category?: string;
  level?: string;
}

const levels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "all", label: "All Levels" },
];

export function SubjectAndLevelBlock({ 
  subject, 
  level, 
  onUpdate, 
  onRemove, 
  isRemovable = false 
}: SubjectAndLevelBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempSubject, setTempSubject] = useState(subject);
  const [tempLevel, setTempLevel] = useState(level);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);

  // Fetch subjects from API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoadingSubjects(true);
        setSubjectsError(null);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subjects`);
        if (!response.ok) {
          throw new Error(`Failed to fetch subjects: ${response.status}`);
        }
        
        const subjectsData = await response.json();
        setSubjects(subjectsData);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setSubjectsError(error instanceof Error ? error.message : 'Failed to fetch subjects');
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleSave = () => {
    if (tempSubject && tempLevel) {
      onUpdate(tempSubject, tempLevel);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempSubject(subject);
    setTempLevel(level);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Paper p="lg" radius="lg" withBorder bg="green.0">
        <Group justify="space-between" mb="md">
          <Text size="sm" c="green" fw={500}>Subject & Level</Text>
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
        
        <Group gap="md">
          <Select
            label="Subject"
            placeholder="Choose subject"
            data={subjects.map(s => ({ value: s.name, label: s.name }))}
            value={tempSubject}
            onChange={(value) => setTempSubject(value || "")}
            searchable
            style={{ flex: 1 }}
            disabled={isLoadingSubjects}
            error={subjectsError}
            rightSection={isLoadingSubjects ? <Loader size="xs" /> : undefined}
          />
          <Select
            label="Level"
            placeholder="Choose level"
            data={levels}
            value={tempLevel}
            onChange={(value) => setTempLevel(value || "")}
            style={{ flex: 1 }}
          />
        </Group>
      </Paper>
    );
  }

  return (
    <Paper p="lg" radius="lg" withBorder bg="gray.0">
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <GraduationCap size={18} color="#40C057" />
          <Text size="sm" c="dimmed" fw={500}>Subject & Level</Text>
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
        {subject && level ? (
          <Group gap="md">
            <Chip 
              size="lg" 
              color="blue" 
              variant="light"
            >
              {subject}
            </Chip>
            <Chip 
              size="lg" 
              color="green" 
              variant="light"
            >
              {levels.find(l => l.value === level)?.label || level}
            </Chip>
          </Group>
        ) : (
          <Text size="lg" c="dimmed" fw={500}>
            Click to set subject and level...
          </Text>
        )}
      </Box>
    </Paper>
  );
}
