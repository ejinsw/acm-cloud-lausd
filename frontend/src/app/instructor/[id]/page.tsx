"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Title,
  Text,
  Grid,
  Stack,
  Avatar,
  Group,
  Button,
  Badge,
  Divider,
  Box,
  Card,
  List,
} from "@mantine/core";
import { useParams } from "next/navigation";
import { Calendar, Clock, Users, Star, BookOpen } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
// Mock data - replace with actual API call
const mockInstructor = {
  id: "1",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  bio: "Experienced mathematics tutor with over 5 years of teaching experience. Specializing in calculus and algebra.",
  education: "Master's in Mathematics from Stanford University",
  educationLevel: "masters",
  subjects: ["calculus", "algebra", "statistics"],
  experience: "5+ years of teaching experience at various institutions",
  certifications: "Certified Mathematics Teacher, Advanced Calculus Certification",
  rating: 4.8,
  totalReviews: 124,
  hourlyRate: 45,
  profileImage: null,
};

function InstructorProfileContent() {
  const params = useParams();
  const [instructor] = useState(mockInstructor);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch instructor data based on ID
    const fetchInstructor = async () => {
      try {
        // const response = await fetch(`/api/instructors/${params.id}`);
        // const data = await response.json();
        // setInstructor(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching instructor:", error);
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [params.id]);

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Grid gutter="xl">
        {/* Left Column - Profile Info */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper radius="md" p="xl" withBorder>
            <Stack gap="lg">
              <Box ta="center">
                <Avatar
                  size={120}
                  radius={120}
                  mx="auto"
                  mb="md"
                  src={instructor.profileImage}
                />
                <Title order={2} ta="center">
                  {instructor.firstName} {instructor.lastName}
                </Title>
                <Text c="dimmed" ta="center" mb="md">
                  Mathematics Tutor
                </Text>
              </Box>

              <Group justify="center" gap="xs">
                <Badge size="lg" variant="light">
                  <Group gap={4}>
                    <Star size={14} />
                    <Text size="sm">{instructor.rating}</Text>
                  </Group>
                </Badge>
                <Badge size="lg" variant="light">
                  <Group gap={4}>
                    <Users size={14} />
                    <Text size="sm">{instructor.totalReviews} reviews</Text>
                  </Group>
                </Badge>
              </Group>

              <Divider />

              <Stack gap="xs">
                <Text fw={500}>Education</Text>
                <Text size="sm">{instructor.education}</Text>
              </Stack>

              <Stack gap="xs">
                <Text fw={500}>Subjects</Text>
                <Group gap="xs">
                  {instructor.subjects.map((subject) => (
                    <Badge key={subject} variant="light">
                      {subject.charAt(0).toUpperCase() + subject.slice(1)}
                    </Badge>
                  ))}
                </Group>
              </Stack>

              <Stack gap="xs">
                <Text fw={500}>Certifications</Text>
                <List size="sm" spacing="xs">
                  {instructor.certifications.split(",").map((cert: string, index: number) => (
                    <List.Item key={index}>{cert.trim()}</List.Item>
                  ))}
                </List>
              </Stack>
            </Stack>
          </Paper>
        </Grid.Col>

        {/* Right Column - Detailed Info and Sessions */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="xl">
            <Paper radius="md" p="xl" withBorder>
              <Title order={3} mb="md">About Me</Title>
              <Text>{instructor.bio}</Text>
            </Paper>

            <Paper radius="md" p="xl" withBorder>
              <Title order={3} mb="md">Teaching Experience</Title>
              <Text>{instructor.experience}</Text>
            </Paper>

            <Paper radius="md" p="xl" withBorder>
              <Title order={3} mb="md">Available Sessions</Title>
              <Grid>
                {/* Mock session cards - replace with actual data */}
                {[1, 2, 3].map((session) => (
                  <Grid.Col key={session} span={{ base: 12, sm: 6 }}>
                    <Card withBorder>
                      <Stack gap="xs">
                        <Text fw={500}>Calculus Fundamentals</Text>
                        <Group gap="xs">
                          <Calendar size={14} />
                          <Text size="sm">Mon, Wed, Fri</Text>
                        </Group>
                        <Group gap="xs">
                          <Clock size={14} />
                          <Text size="sm">4:00 PM - 5:30 PM</Text>
                        </Group>
                        <Group gap="xs">
                          <Users size={14} />
                          <Text size="sm">1-on-1 or Group</Text>
                        </Group>
                        <Group gap="xs">
                          <BookOpen size={14} />
                          <Text size="sm">Beginner Level</Text>
                        </Group>
                        <Button variant="light" fullWidth>
                          View Details
                        </Button>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default function InstructorProfileViewPage() {
  return (
    <PageWrapper>
      <InstructorProfileContent />
    </PageWrapper>
  );
} 