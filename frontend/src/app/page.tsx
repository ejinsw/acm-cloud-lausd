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
  Stack,
} from "@mantine/core";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  User,
  Video,
  Users,
  Star,
  Search,
  GraduationCap,
  Clock,
  HeartHandshake,
} from "lucide-react";
import { routes } from "./routes";

// Features data
const features = [
  {
    icon: <BookOpen size={24} />,
    title: "Expert Tutors",
    description:
      "Connect with qualified tutors specialized in various subjects.",
    color: "blue",
  },
  {
    icon: <Video size={24} />,
    title: "Virtual Learning",
    description: "Join interactive sessions from the comfort of your home.",
    color: "violet",
  },
  {
    icon: <Calendar size={24} />,
    title: "Flexible Scheduling",
    description: "Book sessions at times that work best for your schedule.",
    color: "teal",
  },
  {
    icon: <Star size={24} />,
    title: "Quality Education",
    description: "Access high-quality educational resources and materials.",
    color: "yellow",
  },
];

// Popular subjects
const subjects = [
  { name: "Mathematics", icon: <BookOpen size={18} />, color: "blue" },
  { name: "Science", icon: <BookOpen size={18} />, color: "green" },
  { name: "English", icon: <BookOpen size={18} />, color: "violet" },
  { name: "History", icon: <BookOpen size={18} />, color: "orange" },
  { name: "Spanish", icon: <BookOpen size={18} />, color: "red" },
  { name: "Programming", icon: <BookOpen size={18} />, color: "cyan" },
];

// Stats data
const stats = [
  { value: "500+", label: "Active Tutors", icon: <Users size={24} /> },
  { value: "10k+", label: "Students", icon: <GraduationCap size={24} /> },
  { value: "50k+", label: "Sessions", icon: <Clock size={24} /> },
  { value: "98%", label: "Satisfaction", icon: <HeartHandshake size={24} /> },
];

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <Box
        py={100}
        style={{
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container size="lg">
          <Grid gutter={60}>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xl">
                <Title
                  order={1}
                  size="h1"
                  fw={900}
                  mb="md"
                  style={{ lineHeight: 1.2 }}
                >
                  Empower Your Education with{" "}
                  <Text component="span" c="blue" inherit>
                    LAUSD Tutoring
                  </Text>
                </Title>
                <Text size="xl" c="dimmed" mb="xl" style={{ lineHeight: 1.6 }}>
                  Connect with expert tutors, join interactive sessions, and
                  achieve academic excellence with our personalized learning
                  platform.
                </Text>
                <Group>
                  <Button
                    component={Link}
                    href={routes.exploreSessions}
                    size="lg"
                    rightSection={<Search size={16} />}
                    radius="md"
                  >
                    Find Sessions
                  </Button>
                  <Button
                    component={Link}
                    href={routes.signUp}
                    size="lg"
                    variant="outline"
                    rightSection={<ArrowRight size={16} />}
                    radius="md"
                  >
                    Sign Up
                  </Button>
                </Group>
                <Group mt="lg" gap="xl">
                  <Group gap={5}>
                    <CheckCircle size={16} color="#20c997" />
                    <Text size="sm" fw={500}>
                      Expert tutors
                    </Text>
                  </Group>
                  <Group gap={5}>
                    <CheckCircle size={16} color="#20c997" />
                    <Text size="sm" fw={500}>
                      Flexible scheduling
                    </Text>
                  </Group>
                  <Group gap={5}>
                    <CheckCircle size={16} color="#20c997" />
                    <Text size="sm" fw={500}>
                      Personalized learning
                    </Text>
                  </Group>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Center h="100%">
                <Image
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1200&auto=format&fit=crop"
                  alt="High school students in a modern classroom"
                  w="100%"
                  h={400}
                  radius="md"
                  style={{
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    objectFit: "cover",
                  }}
                />
              </Center>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box py={60} style={{ backgroundColor: "white" }}>
        <Container size="lg">
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={30}>
            {stats.map((stat) => (
              <Paper key={stat.label} p="md" radius="md" withBorder>
                <Group gap="xs" align="center">
                  <ThemeIcon size={40} radius="md" variant="light">
                    {stat.icon}
                  </ThemeIcon>
                  <div>
                    <Text size="xl" fw={700} lh={1}>
                      {stat.value}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {stat.label}
                    </Text>
                  </div>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={80} style={{ backgroundColor: "#f8f9fa" }}>
        <Container size="lg">
          <Stack gap="xl" align="center">
            <div>
              <Title order={2} ta="center" mb="md">
                Why Choose LAUSD Tutoring?
              </Title>
              <Text size="lg" c="dimmed" ta="center" mx="auto" maw={700}>
                Our platform offers a comprehensive learning experience with
                features designed to help students achieve academic success.
              </Text>
            </div>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={30}>
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  shadow="md"
                  radius="md"
                  p="lg"
                  withBorder
                >
                  <ThemeIcon
                    size={50}
                    radius="md"
                    mb="md"
                    color={feature.color}
                  >
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
          </Stack>
        </Container>
      </Box>

      {/* Popular Subjects */}
      <Box py={80}>
        <Container size="lg">
          <Stack gap="xl" align="center">
            <div>
              <Title order={2} ta="center" mb="md">
                Popular Subjects
              </Title>
              <Text size="lg" c="dimmed" ta="center" mx="auto" maw={700}>
                Explore our wide range of subjects and find the perfect tutor
                for your needs
              </Text>
            </div>

            <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing={20}>
              {subjects.map((subject) => (
                <Card
                  key={subject.name}
                  shadow="sm"
                  radius="md"
                  p="md"
                  withBorder
                >
                  <Group gap="xs">
                    <ThemeIcon size={30} radius="md" color={subject.color}>
                      {subject.icon}
                    </ThemeIcon>
                    <div>
                      <Text fw={500} size="sm">
                        {subject.name}
                      </Text>
                    </div>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* How It Works */}
      <Box py={80}>
        <Container size="lg">
          <Stack gap="xl" align="center">
            <div>
              <Title order={2} ta="center" mb="md">
                How It Works
              </Title>
              <Text size="lg" c="dimmed" ta="center" mx="auto" maw={700}>
                Get started with LAUSD Tutoring in just a few simple steps
              </Text>
            </div>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={30}>
              <Paper shadow="md" radius="md" p="xl" withBorder>
                <ThemeIcon size={60} radius="md" mb="md" color="blue">
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
                <ThemeIcon size={60} radius="md" mb="md" color="violet">
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
                <ThemeIcon size={60} radius="md" mb="md" color="teal">
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
                radius="md"
              >
                Get Started
              </Button>
            </Center>
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={80} style={{ backgroundColor: "#f8f9fa" }}>
        <Container size="lg">
          <Paper radius="md" p={60} withBorder>
            <Stack gap="xl" align="center">
              <div style={{ textAlign: "center" }}>
                <Title order={2} mb="md">
                  Ready to Start Your Learning Journey?
                </Title>
                <Text size="lg" c="dimmed" maw={600} mx="auto">
                  Join thousands of students who have already transformed their
                  academic experience with LAUSD Tutoring.
                </Text>
              </div>
              <Group>
                <Button
                  component={Link}
                  href={routes.signUp}
                  size="lg"
                  rightSection={<ArrowRight size={16} />}
                  radius="md"
                >
                  Sign Up Now
                </Button>
                <Button
                  component={Link}
                  href={routes.exploreSessions}
                  size="lg"
                  variant="outline"
                  radius="md"
                >
                  Explore Sessions
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </main>
  );
}
