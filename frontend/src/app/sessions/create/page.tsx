"use client";

import { useState } from "react";
import { 
  Container, 
  Title, 
  Text, 
  Paper, 
  TextInput, 
  Textarea, 
  Button, 
  Select, 
  NumberInput, 
  MultiSelect, 
  Divider,
  Grid,
  Stack,
  Group,
  Switch,
  Chip,
  FileInput,
  Box
} from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import { Calendar, Clock, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

// Sample data
const subjects = [
  { value: "algebra", label: "Algebra" },
  { value: "calculus", label: "Calculus" },
  { value: "statistics", label: "Statistics" },
  { value: "geometry", label: "Geometry" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
  { value: "english", label: "English" },
  { value: "history", label: "History" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "programming", label: "Programming" },
];

const levels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "all", label: "All Levels" },
];

const weekdays = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

interface FormValues {
  title: string;
  subject: string;
  level: string;
  price: number;
  duration: number;
  description: string;
  longDescription: string;
  tags: string[];
  prerequisites: string;
  materials: string;
  goals: string;
  topics: string;
  dates: Date[];
  time: string;
  recurring: boolean;
  availableDays: string[];
  maxStudents: number;
  materials_file: File | null;
}

export default function CreateSessionPage() {
  const router = useRouter();
  const [formValues, setFormValues] = useState<FormValues>({
    title: "",
    subject: "",
    level: "",
    price: 25,
    duration: 60,
    description: "",
    longDescription: "",
    tags: [],
    prerequisites: "",
    materials: "",
    goals: "",
    topics: "",
    dates: [],
    time: "",
    recurring: false,
    availableDays: [],
    maxStudents: 1,
    materials_file: null,
  });
  
  // Handle input changes
  const handleChange = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setFormValues({
      ...formValues,
      [field]: value,
    });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formValues);
    
    // In a real app, we would make an API call here to save the session
    // Then redirect to the session or dashboard
    
    alert("Session created successfully!");
    router.push("/dashboard/instructor");
  };

  return (
    <Container size="xl" py="xl">
      <Paper p="xl" radius="md" withBorder mb="xl">
        <Title order={2} mb="lg">Create New Tutoring Session</Title>
        
        <form onSubmit={handleSubmit}>
          <Grid gutter="lg">
            {/* Left Column */}
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Stack gap="md">
                <Title order={4}>Session Information</Title>
                
                <TextInput
                  label="Session Title"
                  placeholder="E.g., Algebra Fundamentals"
                  required
                  value={formValues.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
                
                <Grid>
                  <Grid.Col span={6}>
                    <Select
                      label="Subject"
                      placeholder="Select a subject"
                      data={subjects}
                      required
                      value={formValues.subject}
                      onChange={(value) => handleChange("subject", value || "")}
                      searchable
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Select
                      label="Level"
                      placeholder="Select a level"
                      data={levels}
                      required
                      value={formValues.level}
                      onChange={(value) => handleChange("level", value || "")}
                    />
                  </Grid.Col>
                </Grid>
                
                <Grid>
                  <Grid.Col span={6}>
                    <NumberInput
                      label="Duration (minutes)"
                      placeholder="60"
                      required
                      min={15}
                      max={240}
                      step={15}
                      value={formValues.duration}
                      onChange={(value) => handleChange("duration", value as number)}
                    />
                  </Grid.Col>
                </Grid>
                
                <Textarea
                  label="Short Description"
                  placeholder="Brief overview of the session (shown in cards)"
                  required
                  minRows={2}
                  maxRows={3}
                  value={formValues.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
                
                <Textarea
                  label="Detailed Description"
                  placeholder="Comprehensive description of what the session covers"
                  required
                  minRows={4}
                  maxRows={8}
                  value={formValues.longDescription}
                  onChange={(e) => handleChange("longDescription", e.target.value)}
                />
                
                <MultiSelect
                  label="Tags"
                  placeholder="Enter keywords related to your session"
                  data={formValues.tags.map(tag => ({ value: tag, label: tag }))}
                  value={formValues.tags}
                  onChange={(value) => handleChange("tags", value)}
                  searchable
                  comboboxProps={{
                    withinPortal: false,
                    transitionProps: { transition: 'pop' },
                  }}
                  onOptionSubmit={(value: string) => {
                    if (!formValues.tags.includes(value)) {
                      handleChange("tags", [...formValues.tags, value]);
                    }
                    return value;
                  }}
                />
                
                <Divider my="lg" />
                
                <Title order={4}>Learning Details</Title>
                
                <Textarea
                  label="Prerequisites"
                  placeholder="What should students already know?"
                  value={formValues.prerequisites}
                  onChange={(e) => handleChange("prerequisites", e.target.value)}
                />
                
                <Textarea
                  label="Materials Needed"
                  placeholder="What materials/equipment will students need?"
                  value={formValues.materials}
                  onChange={(e) => handleChange("materials", e.target.value)}
                />
                
                <Textarea
                  label="Learning Goals"
                  placeholder="What will students be able to do after completing this session? (one per line)"
                  minRows={3}
                  value={formValues.goals}
                  onChange={(e) => handleChange("goals", e.target.value)}
                  description="Enter each goal on a new line"
                />
                
                <Textarea
                  label="Topics Covered"
                  placeholder="List specific topics covered in the session (one per line)"
                  minRows={3}
                  value={formValues.topics}
                  onChange={(e) => handleChange("topics", e.target.value)}
                  description="Enter each topic on a new line"
                />
                
                <FileInput
                  label="Optional Materials"
                  placeholder="Upload handouts or resources (PDF, DOCX, etc.)"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  value={formValues.materials_file}
                  onChange={(file) => handleChange("materials_file", file)}
                  leftSection={<Upload size={16} />}
                />
              </Stack>
            </Grid.Col>
            
            {/* Right Column */}
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Paper p="md" withBorder h="100%">
                <Title order={4} mb="md">Availability Settings</Title>
                
                <Switch
                  label="Recurring Session"
                  description="Enable for regular weekly sessions"
                  checked={formValues.recurring}
                  onChange={(e) => handleChange("recurring", e.currentTarget.checked)}
                  mb="md"
                />
                
                {formValues.recurring ? (
                  <>
                    <Text fw={500} size="sm" mb="xs">Available Days</Text>
                    <Box mb="lg">
                      <Chip.Group
                        multiple
                        value={formValues.availableDays}
                        onChange={(value) => handleChange("availableDays", value)}
                      >
                        <Group>
                          {weekdays.map((day) => (
                            <Chip key={day.value} value={day.value}>
                              {day.label}
                            </Chip>
                          ))}
                        </Group>
                      </Chip.Group>
                    </Box>
                    
                    <TimeInput
                      label="Preferred Time"
                      leftSection={<Clock size={16} />}
                      value={formValues.time}
                      onChange={(e) => handleChange("time", e.currentTarget.value)}
                      mb="md"
                    />
                  </>
                ) : (
                  <>
                    <Text fw={500} size="sm" mb="xs">Available Dates</Text>
                    <DatePickerInput
                      type="multiple"
                      label="Select available dates"
                      placeholder="Pick dates"
                      leftSection={<Calendar size={16} />}
                      value={formValues.dates}
                      onChange={(value) => handleChange("dates", value || [])}
                      mb="md"
                      minDate={new Date()}
                    />
                    
                    <TimeInput
                      label="Preferred Time"
                      leftSection={<Clock size={16} />}
                      value={formValues.time}
                      onChange={(e) => handleChange("time", e.currentTarget.value)}
                      mb="md"
                    />
                  </>
                )}
                
                <NumberInput
                  label="Maximum Students"
                  placeholder="1"
                  description="Number of students allowed per session (1 for one-on-one)"
                  min={1}
                  max={20}
                  value={formValues.maxStudents}
                  onChange={(value) => handleChange("maxStudents", value as number)}
                  mb="xl"
                />
                
                <Box mt={100}>
                  <Divider my="lg" />
                  <Group justify="flex-end">
                    <Button variant="outline" onClick={() => router.push("/dashboard/instructor")}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Session</Button>
                  </Group>
                </Box>
              </Paper>
            </Grid.Col>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
} 