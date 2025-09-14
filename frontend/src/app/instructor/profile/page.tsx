"use client";

import { useState } from "react";
import {
  Container,
  Paper,
  Title,
  TextInput,
  Textarea,
  Button,
  Grid,
  Stack,
  Avatar,
  Group,
  FileInput,
  Select,
  MultiSelect,
  Box,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

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

const educationLevels = [
  { value: "high_school", label: "High School" },
  { value: "associates", label: "Associate's Degree" },
  { value: "bachelors", label: "Bachelor's Degree" },
  { value: "masters", label: "Master's Degree" },
  { value: "phd", label: "PhD" },
  { value: "other", label: "Other" },
];

export default function InstructorProfilePage() {
  const router = useRouter();
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    education: [] as string[],
    educationLevel: "",
    subjects: [] as string[],
    experience: [] as string[],
    certifications: [] as string[],
    profileImage: null as File | null,
    resume: null as File | null,
  });

  const handleChange = (field: string, value: string | string[] | File | null) => {
    setFormValues({
      ...formValues,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Profile updated:", formValues);
    // TODO: Implement profile update logic
    alert("Profile updated successfully!");
  };

  return (
    <Container size="xl" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} mb="xl">Instructor Profile</Title>

        <form onSubmit={handleSubmit}>
          <Grid gutter="xl">
            {/* Left Column - Profile Image and Basic Info */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="lg">
                <Box ta="center">
                  <Avatar
                    size={120}
                    radius={120}
                    mx="auto"
                    mb="md"
                    src={formValues.profileImage ? URL.createObjectURL(formValues.profileImage) : null}
                  />
                  <FileInput
                    label="Profile Picture"
                    placeholder="Upload profile picture"
                    accept="image/png,image/jpeg"
                    value={formValues.profileImage}
                    onChange={(file) => handleChange("profileImage", file)}
                    leftSection={<Upload size={16} />}
                  />
                </Box>

                <TextInput
                  label="First Name"
                  placeholder="Your first name"
                  required
                  value={formValues.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                />

                <TextInput
                  label="Last Name"
                  placeholder="Your last name"
                  required
                  value={formValues.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                />

                <TextInput
                  label="Email"
                  placeholder="your.email@example.com"
                  required
                  value={formValues.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />

                <TextInput
                  label="Phone"
                  placeholder="Your phone number"
                  value={formValues.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </Stack>
            </Grid.Col>

            {/* Right Column - Detailed Information */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="lg">
                <Textarea
                  label="Bio"
                  placeholder="Tell us about yourself"
                  minRows={4}
                  value={formValues.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                />

                <Select
                  label="Education Level"
                  placeholder="Select your highest education"
                  data={educationLevels}
                  value={formValues.educationLevel}
                  onChange={(value) => handleChange("educationLevel", value)}
                />

                <Textarea
                  label="Education Details"
                  placeholder="List your educational background (one per line)"
                  minRows={3}
                  value={(formValues.education || []).join('\n')}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter(line => line.trim() !== '');
                    handleChange("education", lines);
                  }}
                />

                <MultiSelect
                  label="Subjects"
                  placeholder="Select subjects you can teach"
                  data={subjects}
                  value={formValues.subjects}
                  onChange={(value) => handleChange("subjects", value)}
                  searchable
                  clearable
                />

                <Textarea
                  label="Teaching Experience"
                  placeholder="Describe your teaching experience (one per line)"
                  minRows={3}
                  value={(formValues.experience || []).join('\n')}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter(line => line.trim() !== '');
                    handleChange("experience", lines);
                  }}
                />

                <Textarea
                  label="Certifications"
                  placeholder="List your relevant certifications (one per line)"
                  minRows={2}
                  value={(formValues.certifications || []).join('\n')}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter(line => line.trim() !== '');
                    handleChange("certifications", lines);
                  }}
                />

                <FileInput
                  label="Resume/CV"
                  placeholder="Upload your resume"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  value={formValues.resume}
                  onChange={(file) => handleChange("resume", file)}
                  leftSection={<Upload size={16} />}
                />

                <Group justify="flex-end" mt="xl">
                  <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
} 