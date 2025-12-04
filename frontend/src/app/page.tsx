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
    label: "Certified LAUSD teachers",
    value: "540+",
    description: "Active across the district",
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
      "Every session follows LAUSD pacing guides and current classroom assignments.",
    icon: <BookMarked size={22} />,
  },
  {
    title: "Live instruction",
    description:
      "Students meet in real time with credentialed teachers who know their campus.",
    icon: <Radio size={22} />,
  },
  {
    title: "Accountability",
    description:
      "Transparent scheduling, attendance logging, and outcome reporting for families.",
    icon: <Award size={22} />,
  },
];

const highlights = [
  "Live tutoring from LAUSD credentialed teachers",
  "Secure, district-managed platform",
  "Language support for multilingual families",
];

const processSteps = [
  {
    title: "Submit a tutoring request",
    description: "Families or counselors share the student's goals and schedule.",
    icon: <FileText size={24} />,
  },
  {
    title: "Match with an educator",
    description: "The district pairs students with available subject-matter experts.",
    icon: <Calendar size={24} />,
  },
  {
    title: "Join the live session",
    description: "Students connect through secure video with district resources on screen.",
    icon: <Video size={24} />,
  },
];

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1522202176988-66270c353a1d?q=80&w=1200&auto=format&fit=crop",
    title: "Classroom instruction",
    subtitle: "Students learning with a teacher in a district classroom.",
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
    <main style={{ backgroundColor: "#f5f7fb" }}>
      <Box py={80} style={{ borderBottom: "1px solid #e1e6ef" }}>
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
                  Los Angeles Unified School District
                </Badge>
                <Title order={1} size="h1" fw={800} style={{ lineHeight: 1.2 }}>
                  Official Live Tutoring Support
                </Title>
                <Text size="lg" c="dimmed" maw={540}>
                  The LAUSD Tutoring Initiative connects students with verified district
                  teachers for real-time academic support across core curriculum areas.
                </Text>
                <Group gap="md">
                  <Button
                    component={Link}
                    href={routes.exploreSessions}
                    size="lg"
                    rightSection={<ArrowRight size={18} />}
                  >
                    Request a Tutor
                  </Button>
                  <Button
                    component={Link}
                    href={routes.signUp}
                    size="lg"
                    variant="outline"
                  >
                    View Programs
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
              <Paper radius="lg" withBorder p="sm" style={{ backgroundColor: "white" }}>
                <Image
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop"
                  alt="LAUSD students in a classroom with a teacher"
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
                      District classrooms in focus
                    </Text>
                    <Text size="xs" c="dimmed">
                      Photography from LAUSD campuses and tutoring centers.
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
                style={{ backgroundColor: "white" }}
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
                  The tutoring program is administered by LAUSD staff with an emphasis on
                  transparency, student safety, and measurable academic gains.
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
                  <Card key={photo.title} withBorder radius="md" p="sm" style={{ backgroundColor: "white" }}>
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
              <Card key={step.title} withBorder radius="md" p="xl" style={{ backgroundColor: "white" }}>
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

      <Box py={80} style={{ backgroundColor: "#0f172a" }}>
        <Container size="lg">
          <Paper radius="md" p={40} style={{ backgroundColor: "#13223B" }}>
            <Grid gutter={30} align="center">
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Stack gap="sm">
                  <Badge variant="light" color="blue" radius="sm" maw={200}>
                    District program access
                  </Badge>
                  <Title order={2} c="white">
                    Connect with a live tutor this week
                  </Title>
                  <Text c="gray.4">
                    LAUSD families can request a session at any time. A district coordinator will
                    confirm schedules, share resources, and ensure the student is ready.
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
                    href={routes.exploreSessions}
                    variant="white"
                    color="dark"
                    size="lg"
                  >
                    View Schedule
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
