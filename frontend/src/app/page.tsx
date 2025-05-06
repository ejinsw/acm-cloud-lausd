"use client";

import {
  Container,
  Text,
  Title,
  Button,
  Group,
  Grid,
  Paper,
  SimpleGrid,
  Card,
  ThemeIcon,
  Box,
  Center,
  Image,
  Badge,
  Avatar,
} from "@mantine/core";
import Link from "next/link";
import { 
  ArrowRight, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Sparkles, 
  User, 
  Video,
  Users,
  Star,
  Search,
  GraduationCap
} from "lucide-react";
import { routes } from "./routes";

// Features data
const features = [
  {
    icon: <BookOpen size={24} />,
    title: "Expert Tutors",
    description: "Connect with qualified tutors specialized in various subjects.",
  },
  {
    icon: <Video size={24} />,
    title: "Virtual Learning",
    description: "Join interactive sessions from the comfort of your home.",
  },
  {
    icon: <Calendar size={24} />,
    title: "Flexible Scheduling",
    description: "Book sessions at times that work best for your schedule.",
  },
  {
    icon: <Star size={24} />,
    title: "Quality Education",
    description: "Access high-quality educational resources and materials.",
  },
];

// Popular subjects
const subjects = [
  { name: "Mathematics", sessions: 45, icon: <BookOpen size={18} /> },
  { name: "Science", sessions: 38, icon: <BookOpen size={18} /> },
  { name: "English", sessions: 32, icon: <BookOpen size={18} /> },
  { name: "History", sessions: 24, icon: <BookOpen size={18} /> },
  { name: "Spanish", sessions: 20, icon: <BookOpen size={18} /> },
  { name: "Programming", sessions: 18, icon: <BookOpen size={18} /> },
];

// Featured tutors
const tutors = [
  {
    name: "Dr. Sarah Johnson",
    subjects: ["Mathematics", "Physics"],
    sessions: 120,
    rating: 4.9,
    avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=0D8ABC&color=fff",
  },
  {
    name: "Prof. James Smith",
    subjects: ["English Literature", "Writing"],
    sessions: 85,
    rating: 4.7,
    avatar: "https://ui-avatars.com/api/?name=James+Smith&background=8E44AD&color=fff",
  },
  {
    name: "Miguel Hernandez",
    subjects: ["Spanish", "Portuguese"],
    sessions: 74,
    rating: 4.8,
    avatar: "https://ui-avatars.com/api/?name=Miguel+Hernandez&background=27AE60&color=fff",
  },
  {
    name: "Dr. Robert Chen",
    subjects: ["Chemistry", "Biology"],
    sessions: 96,
    rating: 4.9,
    avatar: "https://ui-avatars.com/api/?name=Robert+Chen&background=F39C12&color=fff",
  },
];

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <Box py={100} style={{ backgroundColor: "#f8f9fa" }}>
        <Container size="lg">
          <Grid gutter={60}>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={1} size="h1" fw={900} mb="md">
                Empower Your Education with LAUSD Tutoring
              </Title>
              <Text size="lg" c="dimmed" mb="xl">
                Connect with expert tutors, join interactive sessions, and achieve academic excellence
                with our personalized learning platform.
              </Text>
              <Group>
                <Button 
                  component={Link} 
                  href={routes.exploreSessions} 
                  size="lg" 
                  rightSection={<Search size={16} />}
                >
                  Find Sessions
                </Button>
                <Button 
                  component={Link} 
                  href={routes.signUp} 
                  size="lg" 
                  variant="outline"
                  rightSection={<ArrowRight size={16} />}
                >
                  Sign Up
                </Button>
              </Group>
              <Group mt="lg">
                <Group gap={5}>
                  <CheckCircle size={16} color="#20c997" />
                  <Text size="sm">Expert tutors</Text>
                </Group>
                <Group gap={5}>
                  <CheckCircle size={16} color="#20c997" />
                  <Text size="sm">Flexible scheduling</Text>
                </Group>
                <Group gap={5}>
                  <CheckCircle size={16} color="#20c997" />
                  <Text size="sm">Personalized learning</Text>
                </Group>
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Center h="100%">
                <Image
                  src="https://placehold.co/600x400/e6f7ff/0a85ff?text=Tutoring+Illustration"
                  alt="LAUSD Tutoring"
                  w="100%"
                  h={400}
                />
              </Center>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={80}>
        <Container size="lg">
          <Title order={2} ta="center" mb="lg">
            Why Choose LAUSD Tutoring?
          </Title>
          <Text size="lg" c="dimmed" ta="center" mb={50} mx="auto" maw={700}>
            Our platform offers a comprehensive learning experience with features designed
            to help students achieve academic success.
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={30}>
            {features.map((feature) => (
              <Card key={feature.title} shadow="md" radius="md" p="lg">
                <ThemeIcon size={50} radius="md" mb="md">
                  {feature.icon}
                </ThemeIcon>
                <Text fw={500} size="lg" mb="xs">
                  {feature.title}
                </Text>
                <Text size="sm" c="dimmed">
                  {feature.description}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* How It Works */}
      <Box py={80} style={{ backgroundColor: "#f8f9fa" }}>
        <Container size="lg">
          <Title order={2} ta="center" mb="lg">
            How It Works
          </Title>
          <Text size="lg" c="dimmed" ta="center" mb={50} mx="auto" maw={700}>
            Get started with LAUSD Tutoring in just a few simple steps
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={30}>
            <Paper shadow="md" radius="md" p="xl" withBorder>
              <ThemeIcon size={60} radius="md" mb="md">
                <User size={30} />
              </ThemeIcon>
              <Title order={3} size="h4" mb="xs">
                1. Create Account
              </Title>
              <Text size="sm" c="dimmed">
                Sign up for an account to access our tutoring platform
              </Text>
            </Paper>

            <Paper shadow="md" radius="md" p="xl" withBorder>
              <ThemeIcon size={60} radius="md" mb="md">
                <Search size={30} />
              </ThemeIcon>
              <Title order={3} size="h4" mb="xs">
                2. Find Sessions
              </Title>
              <Text size="sm" c="dimmed">
                Browse and book sessions based on your learning needs
              </Text>
            </Paper>

            <Paper shadow="md" radius="md" p="xl" withBorder>
              <ThemeIcon size={60} radius="md" mb="md">
                <GraduationCap size={30} />
              </ThemeIcon>
              <Title order={3} size="h4" mb="xs">
                3. Start Learning
              </Title>
              <Text size="sm" c="dimmed">
                Join interactive virtual sessions with expert tutors
              </Text>
            </Paper>
          </SimpleGrid>
          
          <Center mt={40}>
            <Button 
              component={Link} 
              href={routes.signUp}
              size="lg"
              rightSection={<ArrowRight size={16} />}
            >
              Get Started
            </Button>
          </Center>
        </Container>
      </Box>

      {/* Popular Subjects */}
      <Box py={80}>
        <Container size="lg">
          <Title order={2} ta="center" mb="lg">
            Popular Subjects
          </Title>
          <Text size="lg" c="dimmed" ta="center" mb={50} mx="auto" maw={700}>
            Explore our most popular tutoring subjects with expert instructors
          </Text>

          <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing={20}>
            {subjects.map((subject) => (
              <Paper 
                key={subject.name} 
                shadow="sm" 
                radius="md" 
                p="md" 
                withBorder 
                ta="center"
                component={Link}
                href={`${routes.exploreSessions}?subject=${subject.name.toLowerCase()}`}
                style={{ 
                  display: 'block',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.2s',
                }}
              >
                <ThemeIcon size={40} radius="md" mb="sm" mx="auto">
                  {subject.icon}
                </ThemeIcon>
                <Text fw={500} mb={5}>
                  {subject.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {subject.sessions} sessions
                </Text>
              </Paper>
            ))}
          </SimpleGrid>

          <Center mt={40}>
            <Button 
              component={Link} 
              href={routes.exploreSessions}
              variant="outline"
              rightSection={<ArrowRight size={16} />}
            >
              View All Subjects
            </Button>
          </Center>
        </Container>
      </Box>

      {/* Featured Tutors */}
      <Box py={80} style={{ backgroundColor: "#f8f9fa" }}>
        <Container size="lg">
          <Title order={2} ta="center" mb="lg">
            Featured Tutors
          </Title>
          <Text size="lg" c="dimmed" ta="center" mb={50} mx="auto" maw={700}>
            Meet our experienced and highly-rated tutoring professionals
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={20}>
            {tutors.map((tutor) => (
              <Card key={tutor.name} shadow="sm" radius="md" padding="lg" withBorder>
                <Card.Section p="md" ta="center">
                  <Avatar src={tutor.avatar} size={80} radius={80} mx="auto" mt={20} />
                  <Text fw={500} size="lg" mt="md">
                    {tutor.name}
                  </Text>
                  <Group justify="center" mt={5}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < Math.floor(tutor.rating) ? "#FFD700" : "none"}
                        color={i < Math.floor(tutor.rating) ? "#FFD700" : "#CCC"}
                      />
                    ))}
                    <Text size="sm">{tutor.rating.toFixed(1)}</Text>
                  </Group>
                </Card.Section>

                <Group gap={7} mt="md" mb="xs">
                  {tutor.subjects.map((subject) => (
                    <Badge key={subject} size="sm">
                      {subject}
                    </Badge>
                  ))}
                </Group>

                <Group mt="md" justify="space-between">
                  <Group gap={5}>
                    <Users size={14} />
                    <Text size="sm">{tutor.sessions} sessions</Text>
                  </Group>
                  <Button
                    component={Link}
                    href={routes.exploreSessions}
                    variant="light"
                    size="xs"
                  >
                    View Profile
                  </Button>
                </Group>
              </Card>
            ))}
          </SimpleGrid>

          <Center mt={40}>
            <Button 
              component={Link} 
              href={routes.exploreSessions}
              variant="outline"
              rightSection={<ArrowRight size={16} />}
            >
              View All Tutors
            </Button>
          </Center>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={100}>
        <Container size="lg">
          <Paper shadow="xl" radius="lg" p={{ base: 30, md: 50 }} style={{ backgroundColor: "#0a85ff" }}>
            <Grid gutter={40}>
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Title order={2} c="white" mb="sm">
                  Ready to Excel in Your Studies?
                </Title>
                <Text size="lg" c="white" opacity={0.9} mb="xl">
                  Join LAUSD Tutoring today and connect with expert tutors for personalized learning
                  experiences designed to help you succeed.
                </Text>
                <Group>
                  <Button 
                    component={Link} 
                    href={routes.exploreSessions} 
                    size="lg" 
                    color="dark"
                  >
                    Explore Sessions
                  </Button>
                  <Button 
                    component={Link} 
                    href={routes.signUp} 
                    variant="white" 
                    size="lg"
                    color="blue"
                  >
                    Sign Up Now
                  </Button>
                </Group>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Center h="100%">
                  <Sparkles size={120} color="white" opacity={0.8} />
                </Center>
              </Grid.Col>
            </Grid>
          </Paper>
        </Container>
      </Box>
    </main>
  );
}
