"use client";

import { useState, useEffect } from "react";
import {
  Container,
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
  Loader,
  Center,
  ThemeIcon,
  RingProgress,
} from "@mantine/core";
import { useParams, useRouter } from "next/navigation";
import { Users, Star, BookOpen, ArrowLeft, Mail, MapPin, GraduationCap, Award } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { routes } from "@/app/routes";
import { getToken } from "@/actions/authentication";
import { User, Session } from "@/lib/types";
import { SessionCard } from "@/components/sessions/SessionCard";

function InstructorProfileContent() {
  const params = useParams();
  const router = useRouter();
  const [instructor, setInstructor] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = await getToken();
        
        // Fetch instructor details
        const instructorResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/instructors/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!instructorResponse.ok) {
          throw new Error("Instructor not found");
        }

        const instructorData = await instructorResponse.json();
        setInstructor(instructorData.instructor);

        // Fetch instructor's sessions
        const sessionsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sessions?instructorId=${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          setSessions(sessionsData.sessions || []);
        }
      } catch (err) {
        console.error("Error fetching instructor data:", err);
        setError(err instanceof Error ? err.message : "Failed to load instructor profile");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchInstructorData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Center py="xl" style={{ minHeight: '60vh' }}>
          <Stack align="center" gap="xl">
            <RingProgress
              size={120}
              thickness={8}
              sections={[{ value: 100, color: 'blue' }]}
              label={
                <Center>
                  <Loader size="lg" />
                </Center>
              }
            />
            <Stack align="center" gap="xs">
              <Text size="xl" fw={600}>Loading Instructor Profile</Text>
              <Text size="md" c="dimmed">Getting all the details ready...</Text>
            </Stack>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (error || !instructor) {
    return (
      <Container size="lg" py="xl">
        <Center py="xl" style={{ minHeight: '60vh' }}>
          <Stack align="center" gap="xl">
            <ThemeIcon size={120} radius="xl" color="red" variant="light">
              <Users size={60} />
            </ThemeIcon>
            <Stack align="center" gap="md">
              <Title order={2} c="red">Instructor Not Found</Title>
              <Text size="lg" c="dimmed" ta="center">
                {error || "The instructor you're looking for doesn't exist or has been removed."}
              </Text>
              <Button 
                size="lg" 
                onClick={() => router.push(routes.exploreSessions)}
                leftSection={<ArrowLeft size={20} />}
              >
                Back to Sessions
              </Button>
            </Stack>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      {/* Back Button */}
      <Button
        variant="subtle"
        leftSection={<ArrowLeft size={16} />}
        onClick={() => router.push(routes.exploreSessions)}
        mb="lg"
      >
        Back to Sessions
      </Button>

      {/* Main Content */}
      <Grid gutter="xl">
        {/* Left Column - Profile Info */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="lg">
            {/* Profile Card */}
            <Card shadow="sm" p="xl" radius="md" withBorder>
              <Stack gap="lg">
                <Box ta="center">
                  <Avatar
                    size={120}
                    radius={120}
                    mx="auto"
                    mb="md"
                    src={instructor.profilePicture}
                    color="blue"
                  >
                    {instructor.firstName?.charAt(0)}{instructor.lastName?.charAt(0)}
                  </Avatar>
                  <Title order={2} ta="center">
                    {instructor.firstName} {instructor.lastName}
                  </Title>
                  <Text c="dimmed" ta="center" mb="md">
                    {instructor.role === 'INSTRUCTOR' ? 'Instructor' : 'Tutor'}
                  </Text>
                </Box>

                <Group justify="center" gap="sm">
                  {instructor.averageRating && (
                    <Badge size="lg" color="green" leftSection={<Star size={14} />}>
                      {instructor.averageRating.toFixed(1)}/5
                    </Badge>
                  )}
                  {instructor.instructorReviews && (
                    <Badge size="lg" color="blue" leftSection={<Users size={14} />}>
                      {instructor.instructorReviews.length} reviews
                    </Badge>
                  )}
                </Group>

                <Divider />

                {instructor.education && instructor.education.length > 0 && (
                  <Stack gap="md">
                    <Group gap="sm">
                      <ThemeIcon size="md" radius="xl" color="blue">
                        <GraduationCap size={16} />
                      </ThemeIcon>
                      <Text fw={500}>Education</Text>
                    </Group>
                    <List size="sm" spacing="xs">
                      {instructor.education.map((edu: string, index: number) => (
                        <List.Item key={index}>{edu}</List.Item>
                      ))}
                    </List>
                  </Stack>
                )}

                {instructor.subjects && instructor.subjects.length > 0 && (
                  <Stack gap="md">
                    <Group gap="sm">
                      <ThemeIcon size="md" radius="xl" color="green">
                        <BookOpen size={16} />
                      </ThemeIcon>
                      <Text fw={500}>Subjects</Text>
                    </Group>
                    <Group gap="xs">
                      {instructor.subjects.map((subject) => (
                        <Badge key={subject.id} variant="light" color="blue">
                          {subject.name}
                        </Badge>
                      ))}
                    </Group>
                  </Stack>
                )}

                {instructor.certificationUrls && instructor.certificationUrls.length > 0 && (
                  <Stack gap="md">
                    <Group gap="sm">
                      <ThemeIcon size="md" radius="xl" color="orange">
                        <Award size={16} />
                      </ThemeIcon>
                      <Text fw={500}>Certifications</Text>
                    </Group>
                    <List size="sm" spacing="xs">
                      {instructor.certificationUrls.map((cert: string, index: number) => (
                        <List.Item key={index}>{cert}</List.Item>
                      ))}
                    </List>
                  </Stack>
                )}
              </Stack>
            </Card>

            {/* Contact Info Card */}
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Title order={3} mb="lg">Contact Information</Title>
              
              <Stack gap="md">
                <Group gap="sm">
                  <ThemeIcon size="md" radius="xl" color="blue">
                    <Mail size={16} />
                  </ThemeIcon>
                  <Text size="sm" fw={500}>{instructor.email}</Text>
                </Group>
                
                {instructor.city && instructor.state && (
                  <Group gap="sm">
                    <ThemeIcon size="md" radius="xl" color="orange">
                      <MapPin size={16} />
                    </ThemeIcon>
                    <Text size="sm" fw={500}>{instructor.city}, {instructor.state}</Text>
                  </Group>
                )}
                
                {instructor.schoolName && (
                  <Group gap="sm">
                    <ThemeIcon size="md" radius="xl" color="green">
                      <GraduationCap size={16} />
                    </ThemeIcon>
                    <Text size="sm" fw={500}>{instructor.schoolName}</Text>
                  </Group>
                )}
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>

        {/* Right Column - Detailed Info and Sessions */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="lg">
            {/* About Me */}
            {instructor.bio && (
              <Card shadow="sm" p="xl" radius="md" withBorder>
                <Title order={3} mb="lg">About Me</Title>
                <Text size="md" lh={1.6}>{instructor.bio}</Text>
              </Card>
            )}

            {/* Teaching Experience */}
            {instructor.experience && instructor.experience.length > 0 && (
              <Card shadow="sm" p="xl" radius="md" withBorder>
                <Title order={3} mb="lg">Teaching Experience</Title>
                <List size="md" spacing="sm">
                  {instructor.experience.map((exp: string, index: number) => (
                    <List.Item key={index}>
                      <Text lh={1.6}>{exp}</Text>
                    </List.Item>
                  ))}
                </List>
              </Card>
            )}

            {/* Available Sessions */}
            <Card shadow="sm" p="xl" radius="md" withBorder>
              <Title order={3} mb="lg">Available Sessions</Title>
              {sessions.length > 0 ? (
                <Grid gutter="md">
                  {sessions.map((session) => (
                    <Grid.Col key={session.id} span={{ base: 12, sm: 6 }}>
                      <SessionCard
                        id={session.id}
                        name={session.name}
                        description={session.description}
                        startTime={session.startTime ? new Date(session.startTime) : undefined}
                        instructor={session.instructor || { id: session.instructorId }}
                        subjects={session.subjects || []}
                        variant="compact"
                      />
                    </Grid.Col>
                  ))}
                </Grid>
              ) : (
                <Box ta="center" py="xl">
                  <Text size="lg" c="dimmed">No sessions available at the moment.</Text>
                  <Text size="sm" c="dimmed" mt="xs">Check back later for new sessions.</Text>
                </Box>
              )}
            </Card>
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