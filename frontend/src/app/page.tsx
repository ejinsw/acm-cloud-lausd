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
    label: "Verified instructors",
    value: "540+",
    description: "Active on the platform",
    icon: <ShieldCheck size={24} />,
  },
  {
    label: "Students served",
    value: "11,200",
    description: "This academic year",
    icon: <Users size={24} />,
  },
  {
    label: "Live tutoring hours",
    value: "68k",
    description: "Delivered since launch",
    icon: <Clock size={24} />,
  },
];

const pillars = [
  {
    title: "Curriculum aligned",
    description:
      "Every session is organized around specific academic goals and assignment context.",
    icon: <BookMarked size={22} />,
  },
  {
    title: "Live instruction",
    description:
      "Students meet in real time with instructors who specialize in each subject area.",
    icon: <Radio size={22} />,
  },
  {
    title: "Accountability",
    description:
      "Transparent queue updates, attendance logging, and outcome reporting for families.",
    icon: <Award size={22} />,
  },
];

const highlights = [
  "Live tutoring from verified instructors",
  "Secure, privacy-first platform",
  "Language support for multilingual families",
];

const processSteps = [
  {
    title: "Submit a tutoring request",
    description: "Share the topic, class context, and what you are stuck on.",
    icon: <FileText size={24} />,
  },
  {
    title: "Match with an instructor",
    description: "The live queue routes requests to available subject-matter experts.",
    icon: <Calendar size={24} />,
  },
  {
    title: "Join the live session",
    description: "Students connect through a secure session link and continue in real time chat.",
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
                  Fast 1:1 tutoring when you need it
                </Title>
                <Text size="lg" c="dimmed" maw={540}>
                  Connect with available instructors in real time, launch a live session, and
                  keep progress moving with a clean, focused learning workspace.
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
                <Title order={2}>Academic assurances</Title>
                <Text size="md" c="dimmed">
                  The tutoring program emphasizes transparency, student safety,
                  and measurable academic gains.
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
          <Stack gap="md" align="center" textAlign="center">
            <Title order={2}>How to receive tutoring</Title>
            <Text size="md" c="dimmed" maw={640} ta="center">
              The process is designed to be straightforward for families, counselors, and site leaders.
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
                    Platform access
                  </Badge>
                  <Title order={2} c="white">
                    Connect with a live tutor this week
                  </Title>
                  <Text c="gray.4">
                    Families can request tutoring any time. Instructors respond through
                    the live queue and move directly into a session when accepted.
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
                    Start Request
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
