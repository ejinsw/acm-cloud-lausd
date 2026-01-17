"use client";

import { useState, useCallback, useEffect } from "react";
import { 
  Title, 
  Text, 
  Paper, 
  Button, 
  Group, 
  Grid,
  Alert,
  Progress,
  Box,
  Stack,
  Modal,
  TextInput
} from "@mantine/core";
import { 
  SessionTitleBlock,
  SubjectAndLevelBlock,
  DescriptionBlock,
  LearningGoalsBlock,
  ScheduleBlock,
  PrerequisitesBlock,
  MaterialsBlock,
  TopicsBlock,
  TagsBlock,
  BlockAdder
} from "@/components/sessions/blocks";
import { CheckCircle, AlertCircle, Save, Trash2, Video } from "lucide-react";
import { getToken } from "@/actions/authentication";
import { Session } from "@/lib/types";

interface SessionData {
  name: string;
  subject: string;
  level: string;
  description: string;
  objectives: string[];
  recurring: boolean;
  availableDays: string[];
  dates: Date[];
  time: string;
  maxAttendees: number;
  duration: number;
  prerequisites: string;
  materials: string[];
  topics: string[];
  tags: string[];
}

interface Block {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

interface CreateSessionFormProps {
  mode: "create" | "edit";
  existingSession?: Session;
  onSuccess: () => void;
}

export default function CreateSessionForm({ mode, existingSession, onSuccess }: CreateSessionFormProps) {
  const [sessionData, setSessionData] = useState<SessionData>({
    name: "",
    subject: "",
    level: "",
    description: "",
    objectives: [],
    recurring: false,
    availableDays: [],
    dates: [],
    time: "",
    maxAttendees: 1,
    duration: 60,
    prerequisites: "",
    materials: [],
    topics: [],
    tags: [],
  });

  const [blocks, setBlocks] = useState<Block[]>([
    { id: "title", type: "title", data: {} },
    { id: "subject-level", type: "subject-level", data: {} },
    { id: "description", type: "description", data: {} },
    { id: "goals", type: "goals", data: {} },
    { id: "schedule", type: "schedule", data: {} },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [blockToRemove, setBlockToRemove] = useState<Block | null>(null);

  // Populate form with existing session data if editing
  useEffect(() => {
    if (mode === "edit" && existingSession) {
      // Convert session data to form format
      const startTime = existingSession.startTime ? new Date(existingSession.startTime) : new Date();
      const endTime = existingSession.endTime ? new Date(existingSession.endTime) : new Date();
      const duration = endTime.getTime() - startTime.getTime();
      
      setSessionData({
        name: existingSession.name || "",
        subject: existingSession.subjects?.[0]?.name || "",
        level: "intermediate", // Default level since it's not in the session model
        description: existingSession.description || "",
        objectives: existingSession.objectives || [],
        recurring: false, // Default since it's not in the session model
        availableDays: [],
        dates: [startTime],
        time: startTime.toTimeString().slice(0, 5), // HH:MM format
        maxAttendees: existingSession.maxAttendees || 1,
        duration: Math.round(duration / (1000 * 60)), // Convert to minutes
        prerequisites: "", // Not in session model
        materials: existingSession.materials || [],
        topics: [], // Not in session model
        tags: [], // Not in session model
      });
    }
  }, [mode, existingSession]);

  // Calculate completion percentage based on required fields
  const requiredFields = ['name', 'subject', 'level', 'description', 'time', 'duration', 'maxAttendees'];
  const completedFields = requiredFields.filter(field => {
    const value = sessionData[field as keyof SessionData];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return value > 0;
    return !!value;
  }).length;
  
  const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);

  // Update session data
  const updateSessionData = useCallback((updates: Partial<SessionData>) => {
    setSessionData(prev => ({ ...prev, ...updates }));
  }, []);

  // Add new block
  const addBlock = useCallback((blockType: string) => {
    const newBlock: Block = {
      id: `${blockType}-${Date.now()}`,
      type: blockType,
      data: {}
    };
    setBlocks(prev => [...prev, newBlock]);
  }, []);

  // Remove block
  const removeBlock = useCallback((blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
  }, []);

  // Handle block removal
  const handleRemoveBlock = (block: Block) => {
    setBlockToRemove(block);
    setRemoveModalOpen(true);
  };

  const confirmRemoveBlock = () => {
    if (blockToRemove) {
      removeBlock(blockToRemove.id);
      setRemoveModalOpen(false);
      setBlockToRemove(null);
    }
  };

  // Get existing block types for filtering
  const existingBlockTypes = blocks.map(block => block.type);

  // Render block based on type
  const renderBlock = (block: Block) => {
    const isRemovable = !['title', 'subject-level', 'description', 'goals', 'schedule'].includes(block.type);
    
    switch (block.type) {
      case 'title':
        return (
          <SessionTitleBlock
            name={sessionData.name}
            onUpdate={(name) => updateSessionData({ name })}
            onRemove={isRemovable ? () => handleRemoveBlock(block) : undefined}
            isRemovable={isRemovable}
          />
        );
      
      case 'subject-level':
        return (
          <SubjectAndLevelBlock
            subject={sessionData.subject}
            level={sessionData.level}
            onUpdate={(subject, level) => updateSessionData({ subject, level })}
            onRemove={isRemovable ? () => handleRemoveBlock(block) : undefined}
            isRemovable={isRemovable}
          />
        );
      
      case 'description':
        return (
          <DescriptionBlock
            description={sessionData.description}
            onUpdate={(description) => updateSessionData({ description })}
            onRemove={isRemovable ? () => handleRemoveBlock(block) : undefined}
            isRemovable={isRemovable}
          />
        );
      
      case 'goals':
        return (
          <LearningGoalsBlock
            objectives={sessionData.objectives}
            onUpdate={(objectives) => updateSessionData({ objectives })}
            onRemove={isRemovable ? () => handleRemoveBlock(block) : undefined}
            isRemovable={isRemovable}
          />
        );
      
      case 'schedule':
        return (
          <ScheduleBlock
            recurring={sessionData.recurring}
            availableDays={sessionData.availableDays}
            dates={sessionData.dates}
            time={sessionData.time}
            maxStudents={sessionData.maxAttendees}
            duration={sessionData.duration}
            onUpdate={(data) => updateSessionData({
              recurring: data.recurring,
              availableDays: data.availableDays,
              dates: data.dates,
              time: data.time,
              maxAttendees: data.maxStudents,
              duration: data.duration,
            })}
            onRemove={isRemovable ? () => handleRemoveBlock(block) : undefined}
            isRemovable={isRemovable}
          />
        );
      
      case 'prerequisites':
        return (
          <PrerequisitesBlock
            prerequisites={sessionData.prerequisites}
            onUpdate={(prerequisites) => updateSessionData({ prerequisites })}
            onRemove={isRemovable ? () => handleRemoveBlock(block) : undefined}
            isRemovable={isRemovable}
          />
        );
      
      case 'materials':
        return (
          <MaterialsBlock
            materials={sessionData.materials}
            onUpdate={(materials) => updateSessionData({ materials })}
            onRemove={isRemovable ? () => handleRemoveBlock(block) : undefined}
            isRemovable={isRemovable}
          />
        );
      
      case 'topics':
        return (
          <TopicsBlock
            topics={sessionData.topics}
            onUpdate={(topics) => updateSessionData({ topics })}
            onRemove={isRemovable ? () => handleRemoveBlock(block) : undefined}
            isRemovable={isRemovable}
          />
        );
      
      case 'tags':
        return (
          <TagsBlock
            tags={sessionData.tags}
            onUpdate={(tags) => updateSessionData({ tags })}
            onRemove={isRemovable ? () => handleRemoveBlock(block) : undefined}
            isRemovable={isRemovable}
          />
        );
      
      default:
        return null;
    }
  };

  // Calculate start and end times for the first selected date
  const calculateSessionTimes = () => {
    if (!sessionData.dates.length || !sessionData.time) return null;
    
    const [hours, minutes] = sessionData.time.split(':').map(Number);
    const startDate = new Date(sessionData.dates[0]);
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + sessionData.duration);
    
    return { startTime: startDate, endTime: endDate };
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (completionPercentage < 100) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const sessionTimes = calculateSessionTimes();
      if (!sessionTimes) {
        throw new Error('Please select dates and time for your session');
      }

      // Prepare session data for API
      const sessionPayload = {
        name: sessionData.name,
        description: sessionData.description,
        startTime: sessionTimes.startTime.toISOString(),
        endTime: sessionTimes.endTime.toISOString(),
        maxAttendees: sessionData.maxAttendees,
        materials: sessionData.materials,
        objectives: sessionData.objectives,
        subjects: [sessionData.subject], // API expects array of subject names
      };

      const url = mode === "edit" 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${existingSession?.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/sessions`;

      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sessionPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle Zoom connection error specifically
        if (errorData.needsZoomConnection) {
          alert(`${errorData.message}\n\nYou will be redirected to connect your Zoom account.`);
          window.location.href = '/dashboard/instructor?tab=zoom';
          return;
        }
        
        throw new Error(errorData.message || `Failed to ${mode} session`);
      }

      const result = await response.json();
      console.log(`Session ${mode === 'edit' ? 'updated' : 'created'} successfully:`, result);
      
      // Call success callback
      onSuccess();
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} session:`, error);
      alert(`Error ${mode === 'edit' ? 'updating' : 'creating'} session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Progress Bar */}
      <Paper p="xl" radius="md" withBorder mb="xl">
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={2}>
              {mode === "edit" ? "Edit Session" : "Create New Session"}
            </Title>
            <Text c="dimmed">
              {mode === "edit" 
                ? "Update your session details" 
                : "Build your tutoring session with our interactive builder"
              }
            </Text>
          </div>
        </Group>
        
        {/* Progress Bar */}
        <Box mb="lg">
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>Session Completion</Text>
            <Text size="sm" c="dimmed">
              {completedFields} of {requiredFields.length} required fields completed
            </Text>
          </Group>
          <Progress 
            value={completionPercentage} 
            color={completionPercentage === 100 ? "green" : "blue"}
            size="md"
            title={`${completionPercentage}% Complete - ${requiredFields.length - completedFields} field(s) remaining`}
          />
        </Box>

        {/* Completion Status */}
        {completionPercentage === 100 ? (
          <Alert icon={<CheckCircle size={16} />} title="Ready to Save!" color="green">
            All required fields are completed. You can now {mode === "edit" ? "update" : "create"} your session!
          </Alert>
        ) : (
          <Alert icon={<AlertCircle size={16} />} title="Complete Required Fields" color="blue">
            Please complete all required fields before {mode === "edit" ? "updating" : "creating"} your session.
          </Alert>
        )}

        {/* Missing Fields Breakdown */}
        {completionPercentage < 100 && (
          <Box mt="md">
            <Text size="sm" fw={500} mb="xs" c="dimmed">What you still need to complete:</Text>
            <Stack gap="xs">
              {!sessionData.name && (
                <Group gap="xs">
                  <Box w={8} h={8} bg="red" style={{ borderRadius: '50%' }} />
                  <Text size="sm" c="red">Session name</Text>
                </Group>
              )}
              {!sessionData.subject && (
                <Group gap="xs">
                  <Box w={8} h={8} bg="red" style={{ borderRadius: '50%' }} />
                  <Text size="sm" c="red">Subject</Text>
                </Group>
              )}
              {!sessionData.level && (
                <Group gap="xs">
                  <Box w={8} h={8} bg="red" style={{ borderRadius: '50%' }} />
                  <Text size="sm" c="red">Level</Text>
                </Group>
              )}
              {!sessionData.description && (
                <Group gap="xs">
                  <Box w={8} h={8} bg="red" style={{ borderRadius: '50%' }} />
                  <Text size="sm" c="red">Session description</Text>
                </Group>
              )}
              {!sessionData.time && (
                <Group gap="xs">
                  <Box w={8} h={8} bg="red" style={{ borderRadius: '50%' }} />
                  <Text size="sm" c="red">Session time</Text>
                </Group>
              )}
              {!sessionData.duration && (
                <Group gap="xs">
                  <Box w={8} h={8} bg="red" style={{ borderRadius: '50%' }} />
                  <Text size="sm" c="red">Session duration</Text>
                </Group>
              )}
              {!sessionData.maxAttendees && (
                <Group gap="xs">
                  <Box w={8} h={8} bg="red" style={{ borderRadius: '50%' }} />
                  <Text size="sm" c="red">Maximum attendees</Text>
                </Group>
              )}
              {sessionData.recurring && sessionData.availableDays.length === 0 && (
                <Group gap="xs">
                  <Box w={8} h={8} bg="orange" style={{ borderRadius: '50%' }} />
                  <Text size="sm" c="orange">Available days for recurring sessions</Text>
                </Group>
              )}
              {!sessionData.recurring && sessionData.dates.length === 0 && (
                <Group gap="xs">
                  <Box w={8} h={8} bg="orange" style={{ borderRadius: '50%' }} />
                  <Text size="sm" c="orange">Session dates for one-time sessions</Text>
                </Group>
              )}
            </Stack>
            
            {/* Optional Fields Section */}
            <Box mt="md">
              <Text size="sm" fw={500} mb="xs" c="dimmed">Optional enhancements:</Text>
              <Stack gap="xs">
                {sessionData.objectives.length === 0 && (
                  <Group gap="xs">
                    <Box w={8} h={8} bg="blue" style={{ borderRadius: '50%' }} />
                    <Text size="sm" c="blue">Learning objectives</Text>
                  </Group>
                )}
                {sessionData.materials.length === 0 && (
                  <Group gap="xs">
                    <Box w={8} h={8} bg="blue" style={{ borderRadius: '50%' }} />
                    <Text size="sm" c="blue">Materials needed</Text>
                  </Group>
                )}
                {sessionData.prerequisites && (
                  <Group gap="xs">
                    <Box w={8} h={8} bg="blue" style={{ borderRadius: '50%' }} />
                    <Text size="sm" c="blue">Prerequisites</Text>
                  </Group>
                )}
                {sessionData.topics.length === 0 && (
                  <Group gap="xs">
                    <Box w={8} h={8} bg="blue" style={{ borderRadius: '50%' }} />
                    <Text size="sm" c="blue">Topics covered</Text>
                  </Group>
                )}
                {sessionData.tags.length === 0 && (
                  <Group gap="xs">
                    <Box w={8} h={8} bg="blue" style={{ borderRadius: '50%' }} />
                    <Text size="sm" c="blue">Session tags</Text>
                  </Group>
                )}
              </Stack>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Session Builder - Grid Layout */}
      <Grid gutter="lg">
        {/* Left Column - Core Blocks */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            {/* Title Block - Full Width */}
            {blocks.filter(b => b.type === 'title').map(block => (
              <div key={block.id}>
                {renderBlock(block)}
              </div>
            ))}
            
            {/* Subject & Level Block - Full Width */}
            {blocks.filter(b => b.type === 'subject-level').map(block => (
              <div key={block.id}>
                {renderBlock(block)}
              </div>
            ))}
            
            {/* Description Block - Full Width */}
            {blocks.filter(b => b.type === 'description').map(block => (
              <div key={block.id}>
                {renderBlock(block)}
              </div>
            ))}
            
            {/* Learning Goals Block - Full Width */}
            {blocks.filter(b => b.type === 'goals').map(block => (
              <div key={block.id}>
                {renderBlock(block)}
              </div>
            ))}
            
            {/* Additional Blocks - Dynamic */}
            {blocks.filter(b => !['title', 'subject-level', 'description', 'goals', 'schedule'].includes(b.type)).map(block => (
              <div key={block.id}>
                {renderBlock(block)}
              </div>
            ))}
            
            {/* Block Adder */}
            <BlockAdder 
              onAddBlock={addBlock} 
              existingBlocks={existingBlockTypes}
            />
          </Stack>
        </Grid.Col>
        
        {/* Right Column - Schedule & Actions */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            {/* Schedule Block */}
            {blocks.filter(b => b.type === 'schedule').map(block => (
              <div key={block.id}>
                {renderBlock(block)}
              </div>
            ))}
            
            {/* Zoom Integration Info */}
            <Paper p="lg" radius="md" withBorder>
              <Stack gap="md">
                <Group gap="xs">
                  <Video size={18} color="#228BE6" />
                  <Text size="sm" fw={500}>Video Meeting</Text>
                </Group>
                <Text size="xs" c="dimmed">
                  Zoom meetings will be automatically created for your sessions. 
                  Make sure you have connected your Zoom account in the dashboard.
                </Text>
              </Stack>
            </Paper>
            
            {/* Submit Section */}
            <Paper p="lg" radius="md" withBorder>
              <Stack gap="md">
                <Text size="lg" fw={500}>
                  Ready to {mode === "edit" ? "update" : "create"} your session?
                </Text>
                <Text size="sm" c="dimmed">
                  Review your session details and click {mode === "edit" ? "update" : "create"} when ready
                </Text>
                
                {/* Quick Missing Fields Summary */}
                {completionPercentage < 100 && (
                  <Box p="sm" bg="red.0" style={{ borderRadius: '8px' }}>
                    <Text size="sm" fw={500} c="red" mb="xs">
                      Missing Required Fields:
                    </Text>
                    <Text size="xs" c="red">
                      {requiredFields.filter(field => {
                        const value = sessionData[field as keyof SessionData];
                        if (Array.isArray(value)) return value.length === 0;
                        if (typeof value === 'string') return value.trim().length === 0;
                        if (typeof value === 'number') return value <= 0;
                        return !value;
                      }).length} field(s) still need to be completed
                    </Text>
                  </Box>
                )}
                
                {/* Optional Fields Summary */}
                {completionPercentage === 100 && (
                  <Box p="sm" bg="blue.0" style={{ borderRadius: '8px' }}>
                    <Text size="sm" fw={500} c="blue" mb="xs">
                      Optional Enhancements:
                    </Text>
                    <Text size="xs" c="blue">
                      Consider adding learning objectives, materials, and other details to make your session more attractive to students
                    </Text>
                  </Box>
                )}
                
                <Button
                  size="lg"
                  leftSection={<Save size={20} />}
                  onClick={handleSubmit}
                  disabled={completionPercentage < 100 || isSubmitting}
                  loading={isSubmitting}
                  fullWidth
                >
                  {isSubmitting 
                    ? (mode === "edit" ? 'Updating...' : 'Creating...') 
                    : (mode === "edit" ? 'Update Session' : 'Create Session')
                  }
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Remove Block Confirmation Modal */}
      <Modal 
        opened={removeModalOpen} 
        onClose={() => setRemoveModalOpen(false)}
        title="Remove Block"
        centered
      >
        <Stack>
          <Text>
            Are you sure you want to remove the &quot;{blockToRemove?.type.replace('-', ' ')}&quot; block? 
            This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setRemoveModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              color="red" 
              leftSection={<Trash2 size={16} />}
              onClick={confirmRemoveBlock}
            >
              Remove Block
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
