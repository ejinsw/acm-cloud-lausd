"use client";

import {
  Box,
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
  Image,
  Stack,
  Badge,
  Divider,
} from "@mantine/core";
import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  FileText,
  Radio,
  ShieldCheck,
  Users,
  Video,
  Award,
} from "lucide-react";
import { routes } from "./routes";

const stats = [
  {
    label: "Queue-based matching",
    value: "Live",
    description: "Students and instructors connected in real time",
    icon: <ShieldCheck size={24} />,
  },
  {
    label: "1-1 sessions",
    value: "Focused",
    description: "One student, one instructor per session",
    icon: <Users size={24} />,
  },
  {
    label: "Session support",
    value: "Built-in",
    description: "Chat, video, and sync across devices",
    icon: <Clock size={24} />,
  },
];

const pillars = [
  {
    title: "Curriculum aligned",
    description:
      "Sessions can be organized around specific academic goals and assignment context.",
    icon: <BookMarked size={22} />,
  },
  {
    title: "Live 1-1 instruction",
    description:
      "Students and instructors meet in real time through the queue and session link.",
    icon: <Radio size={22} />,
  },
  {
    title: "Accountability",
    description:
      "Queue status, attendance, and reporting to support districts and families.",
    icon: <Award size={22} />,
  },
];

const highlights = [
  "Live 1-1 sessions via the queue",
  "Secure, privacy-first platform",
  "Support for multilingual use",
];

const processSteps = [
  {
    title: "Enter the queue",
    description: "Pick a subject or topic and add a short description of what you need.",
    icon: <FileText size={24} />,
  },
  {
    title: "Get matched",
    description: "The queue connects you with an available instructor when they accept.",
    icon: <Calendar size={24} />,
  },
  {
    title: "Join the live session",
    description: "Connect through the session link and work together in real time.",
    icon: <Video size={24} />,
  },
];

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1522202176988-66270c353a1d?q=80&w=1200&auto=format&fit=crop",
    title: "Classroom instruction",
    subtitle: "Students learning with a teacher in a classroom environment.",
  },
  {
    src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop",
    title: "Small group learning",
    subtitle: "Teacher working with students in a focused classroom setting.",
  },
  {
    src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1200&auto=format&fit=crop",
    title: "Interactive teaching",
    subtitle: "Students engaged with their teacher during a live tutoring session.",
  },
];

export default function Home() {
  return (
    <main>
      <Box
        py={92}
        style={{
          background:
            "radial-gradient(circle at 15% 20%, rgba(39,116,174,0.22), transparent 30%), radial-gradient(circle at 90% 0%, rgba(255,209,0,0.2), transparent 28%), linear-gradient(180deg, #f4f8fc 0%, #edf4fb 100%)",
          borderBottom: "1px solid rgba(39,116,174,0.14)",
        }}
      >
        <Container size="lg">
          <Grid gutter={60} align="center">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="lg">
                <Badge
                  variant="light"
                  color="blue"
                  radius="sm"
                  size="lg"
                  style={{ width: "fit-content", letterSpacing: 0.5 }}
                >
                  Live, queue-based tutoring
                </Badge>
                <Title order={1} size="h1" fw={800} style={{ lineHeight: 1.2 }}>
                  Queue-based 1:1 tutoring for your district
                </Title>
                <Text size="lg" c="dimmed" maw={540}>
                  A platform schools use to run live tutoring: students join the queue,
                  instructors accept requests, and everyone meets in a focused 1:1 session.
                </Text>
                <Group gap="md">
                  <Button
                    component={Link}
                    href={routes.signUp}
                    size="lg"
                    rightSection={<ArrowRight size={18} />}
                  >
                    Create Account
                  </Button>
                  <Button
                    component={Link}
                    href={routes.signIn}
                    size="lg"
                    variant="outline"
                  >
                    Sign In
                  </Button>
                </Group>
                <Stack gap="sm">
                  {highlights.map((item) => (
                    <Group key={item} gap="sm" align="flex-start">
                      <CheckCircle size={18} color="#1261A0" style={{ marginTop: 2 }} />
                      <Text size="sm" fw={500} c="dimmed">
                        {item}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper radius="lg" withBorder p="sm" className="app-glass">
                <Image
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop"
                  alt="Students in a classroom with a teacher"
                  radius="md"
                  height={360}
                  style={{ objectFit: "cover" }}
                />
                <Group mt="sm" gap="sm">
                  <ThemeIcon size={34} radius="md" variant="light" color="blue">
                    <Camera size={18} />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text size="sm" fw={600}>
                      Classroom learning in focus
                    </Text>
                    <Text size="xs" c="dimmed">
                      Real classroom and tutoring environments.
                    </Text>
                  </Stack>
                </Group>
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      <Box py={60}>
        <Container size="lg">
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {stats.map((stat) => (
              <Paper
                key={stat.label}
                withBorder
                radius="md"
                p="xl"
                className="app-glass"
              >
                <Group align="flex-start" gap="md">
                  <ThemeIcon size={46} radius="md" variant="light" color="blue">
                    {stat.icon}
                  </ThemeIcon>
                  <Stack gap={4}>
                    <Text size="xl" fw={700}>
                      {stat.value}
                    </Text>
                    <Text fw={500}>{stat.label}</Text>
                    <Text size="sm" c="dimmed">
                      {stat.description}
                    </Text>
                  </Stack>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box py={80} style={{ borderTop: "1px solid #e1e6ef", borderBottom: "1px solid #e1e6ef" }}>
        <Container size="lg">
          <Grid gutter={40} align="center">
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Stack gap="md">
                <Title order={2}>What the platform supports</Title>
                <Text size="md" c="dimmed">
                  Queue-based matching, live 1-1 sessions, and reporting so districts
                  can run transparent, safe tutoring programs.
                </Text>
                <Divider my="md" variant="dashed" />
                <Stack gap="lg">
                  {pillars.map((pillar) => (
                    <Group key={pillar.title} align="flex-start" gap="md">
                      <ThemeIcon size={40} radius="md" variant="light" color="blue">
                        {pillar.icon}
                      </ThemeIcon>
                      <div>
                        <Text fw={600}>{pillar.title}</Text>
                        <Text size="sm" c="dimmed">
                          {pillar.description}
                        </Text>
                      </div>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 7 }}>
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                {galleryImages.map((photo) => (
                  <Card key={photo.title} withBorder radius="md" p="sm" className="app-glass">
                    <Image
                      src={photo.src}
                      alt={photo.title}
                      radius="sm"
                      height={180}
                      style={{ objectFit: "cover" }}
                    />
                    <Stack gap={2} mt="sm">
                      <Text fw={600} size="sm">
                        {photo.title}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {photo.subtitle}
                      </Text>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      <Box py={80}>
        <Container size="lg">
            <Stack gap="md" align="center" style={{ textAlign: "center" }}>
            <Title order={2}>How the queue works</Title>
            <Text size="md" c="dimmed" maw={640} ta="center">
              Students enter the queue; when an instructor is available and accepts, they join a live 1-1 session.
            </Text>
          </Stack>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" mt={40}>
            {processSteps.map((step, index) => (
              <Card key={step.title} withBorder radius="md" p="xl" className="app-glass">
                <Stack gap="md" align="flex-start">
                  <Badge color="blue" variant="light">
                    Step {index + 1}
                  </Badge>
                  <ThemeIcon size={48} radius="md" variant="light" color="blue">
                    {step.icon}
                  </ThemeIcon>
                  <Text fw={600}>{step.title}</Text>
                  <Text size="sm" c="dimmed">
                    {step.description}
                  </Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box
        py={80}
        style={{
          background:
            "linear-gradient(130deg, #0B1F3B 0%, #132F54 55%, #1A3A60 100%)",
        }}
      >
        <Container size="lg">
          <Paper
            radius="md"
            p={40}
            style={{
              background:
                "linear-gradient(135deg, rgba(19,34,59,0.95), rgba(15,44,80,0.92))",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <Grid gutter={30} align="center">
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Stack gap="sm">
                  <Badge variant="light" color="blue" radius="sm" maw={200}>
                    Get started
                  </Badge>
                  <Title order={2} c="white">
                    Run queue-based 1:1 tutoring for your district
                  </Title>
                  <Text c="gray.4">
                    Students join the queue; instructors accept requests and start live sessions.
                    Sign up or sign in to use the platform.
                  </Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Stack gap="sm">
                  <Button
                    component={Link}
                    href={routes.signUp}
                    size="lg"
                    rightSection={<ArrowRight size={16} />}
                  >
                    Create Account
                  </Button>
                  <Button
                    component={Link}
                    href={routes.help}
                    variant="white"
                    color="dark"
                    size="lg"
                  >
                    Learn More
                  </Button>
                </Stack>
              </Grid.Col>
            </Grid>
          </Paper>
        </Container>
      </Box>
    </main>
  );
}
