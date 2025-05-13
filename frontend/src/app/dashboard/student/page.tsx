"use client";

import { useState } from "react";
import {
  Container,
  Title,
  Grid,
  Paper,
  Tabs,
  Button,
  Card,
  Text,
  Group,
  Badge,
  ActionIcon,
  Box,
  Avatar,
  Progress,
  RingProgress,
} from "@mantine/core";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  ArrowUpRight,
  BookOpen,
  Sparkles,
  Star,
  GraduationCap,
  Users,
  Heart,
  Search,
} from "lucide-react";

// Mock data
const enrolledSessions = [
  {
    id: "1",
    title: "Algebra Fundamentals",
    instructor: {
      name: "Dr. Sarah Johnson",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=0D8ABC&color=fff",
      rating: 4.9,
    },
    subject: "Mathematics",
    level: "Beginner",
    completedLessons: 5,
    totalLessons: 8,
    nextSession: "Oct 18, 2023 at 4:00 PM",
    status: "in-progress",
  },
  {
    id: "2",
    title: "Spanish for Beginners",
    instructor: {
      name: "Miguel Hernandez",
      avatar: "https://ui-avatars.com/api/?name=Miguel+Hernandez&background=27AE60&color=fff",
      rating: 4.7,
    },
    subject: "Languages",
    level: "Beginner",
    completedLessons: 3,
    totalLessons: 10,
    nextSession: "Oct 20, 2023 at 5:00 PM",
    status: "in-progress",
  },
  {
    id: "3",
    title: "Introduction to Chemistry",
    instructor: {
      name: "Dr. Emma Wilson",
      avatar: "https://ui-avatars.com/api/?name=Emma+Wilson&background=E74C3C&color=fff",
      rating: 4.8,
    },
    subject: "Science",
    level: "Beginner",
    completedLessons: 0,
    totalLessons: 6,
    nextSession: "Oct 22, 2023 at 3:30 PM",
    status: "not-started",
  },
];

const recommendedSessions = [
  {
    id: "4",
    title: "Essay Writing Workshop",
    instructor: {
      name: "Prof. James Smith",
      avatar: "https://ui-avatars.com/api/?name=James+Smith&background=8E44AD&color=fff",
      rating: 4.6,
    },
    subject: "English",
    level: "Intermediate",
    price: 22,
    duration: 60,
    startDate: "Nov 5, 2023",
    students: 8,
  },
  {
    id: "5",
    title: "Geometry Basics",
    instructor: {
      name: "Dr. Sarah Johnson",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=0D8ABC&color=fff",
      rating: 4.9,
    },
    subject: "Mathematics",
    level: "Beginner",
    price: 25,
    duration: 60,
    startDate: "Nov 8, 2023",
    students: 6,
  },
  {
    id: "6",
    title: "Biology: Human Anatomy",
    instructor: {
      name: "Dr. Robert Chen",
      avatar: "https://ui-avatars.com/api/?name=Robert+Chen&background=F39C12&color=fff",
      rating: 4.8,
    },
    subject: "Science",
    level: "Intermediate",
    price: 30,
    duration: 90,
    startDate: "Oct 28, 2023",
    students: 4,
  },
];

const achievementStats = {
  totalSessions: 12,
  hoursLearned: 18,
  subjectsCovered: 3,
  streak: 8,
};

function StatusBadge({ status }: { status: string }) {
  let color;
  let label;

  switch (status) {
    case "in-progress":
      color = "blue";
      label = "In Progress";
      break;
    case "not-started":
      color = "gray";
      label = "Not Started";
      break;
    case "completed":
      color = "green";
      label = "Completed";
      break;
    default:
      color = "blue";
      label = status;
  }

  return <Badge color={color}>{label}</Badge>;
}

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<string | null>("overview");

  // Calculate completion percentage for all courses
  const totalLessons = enrolledSessions.reduce((total, session) => total + session.totalLessons, 0);
  const completedLessons = enrolledSessions.reduce((total, session) => total + session.completedLessons, 0);
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <Container size="xl" py="xl">
      <Paper p="xl" radius="md" withBorder mb="xl">
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={2}>Student Dashboard</Title>
            <Text c="dimmed">Track your learning and discover new sessions</Text>
          </div>
          <Button 
            component={Link} 
            href="/sessions/explore" 
            leftSection={<Search size={18} />}
          >
            Find Sessions
          </Button>
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<Sparkles size={16} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="my-sessions" leftSection={<BookOpen size={16} />}>
              My Sessions
            </Tabs.Tab>
            <Tabs.Tab value="achievements" leftSection={<GraduationCap size={16} />}>
              Achievements
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview">
            <Box pt="md">
              <Title order={3} mb="md">Learning Dashboard</Title>
              
              {/* Progress overview */}
              <Paper p="md" radius="md" withBorder mb="xl">
                <Group align="flex-start">
                  <div style={{ flex: 1 }}>
                    <Text fw={500} mb="xs">Overall Learning Progress</Text>
                    <Progress 
                      value={overallProgress} 
                      size="lg" 
                      radius="md" 
                      color={overallProgress < 30 ? "red" : overallProgress < 70 ? "yellow" : "green"}
                      mb="xs"
                    />
                    <Text size="sm" c="dimmed">
                      {completedLessons} of {totalLessons} lessons completed ({overallProgress}%)
                    </Text>
                  </div>
                  <RingProgress
                    size={120}
                    thickness={12}
                    roundCaps
                    sections={[
                      { value: overallProgress, color: "blue" },
                    ]}
                    label={
                      <Text ta="center" fw={700} size="xl">
                        {overallProgress}%
                      </Text>
                    }
                  />
                </Group>
              </Paper>
              
              {/* Stats Grid */}
              <Grid mb="xl">
                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                  <Paper p="md" radius="md" withBorder>
                    <Text size="sm" c="dimmed" tt="uppercase" mb="xs">Total Sessions</Text>
                    <Group align="center">
                      <BookOpen size={20} color="#1971C2" stroke={1.5} />
                      <Text fw={700} size="xl">{achievementStats.totalSessions}</Text>
                    </Group>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                  <Paper p="md" radius="md" withBorder>
                    <Text size="sm" c="dimmed" tt="uppercase" mb="xs">Hours Learned</Text>
                    <Group align="center">
                      <Clock size={20} color="#1971C2" stroke={1.5} />
                      <Text fw={700} size="xl">{achievementStats.hoursLearned}</Text>
                    </Group>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                  <Paper p="md" radius="md" withBorder>
                    <Text size="sm" c="dimmed" tt="uppercase" mb="xs">Subjects</Text>
                    <Group align="center">
                      <BookOpen size={20} color="#1971C2" stroke={1.5} />
                      <Text fw={700} size="xl">{achievementStats.subjectsCovered}</Text>
                    </Group>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                  <Paper p="md" radius="md" withBorder>
                    <Text size="sm" c="dimmed" tt="uppercase" mb="xs">Day Streak</Text>
                    <Group align="center">
                      <Sparkles size={20} color="#1971C2" stroke={1.5} />
                      <Text fw={700} size="xl">{achievementStats.streak}</Text>
                    </Group>
                  </Paper>
                </Grid.Col>
              </Grid>
              
              {/* Upcoming sessions */}
              <Title order={4} mb="md">Upcoming Sessions</Title>
              <Grid mb="xl">
                {enrolledSessions.slice(0, 2).map((session) => (
                  <Grid.Col key={session.id} span={{ base: 12, md: 6 }}>
                    <Card withBorder radius="md" p="md">
                      <Group justify="space-between" mb="xs">
                        <Text fw={500}>{session.title}</Text>
                        <StatusBadge status={session.status} />
                      </Group>
                      <Group mb="xs">
                        <Avatar src={session.instructor.avatar} size="sm" radius="xl" />
                        <Text size="sm">{session.instructor.name}</Text>
                      </Group>
                      <Text size="sm" c="dimmed" mb="md">
                        <Calendar size={14} style={{ display: "inline", marginRight: 5 }} />
                        Next: {session.nextSession}
                      </Text>
                      <Progress 
                        value={(session.completedLessons / session.totalLessons) * 100} 
                        size="sm" 
                        radius="xs" 
                        mb="xs"
                      />
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          {session.completedLessons} of {session.totalLessons} lessons completed
                        </Text>
                        <Button 
                          component={Link} 
                          href={`/sessions/${session.id}`} 
                          variant="light" 
                          size="xs" 
                          rightSection={<ArrowUpRight size={14} />}
                        >
                          Details
                        </Button>
                      </Group>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
              
              {/* Recommended sessions */}
              <Title order={4} mb="md">Recommended for You</Title>
              <Grid>
                {recommendedSessions.slice(0, 3).map((session) => (
                  <Grid.Col key={session.id} span={{ base: 12, md: 6, lg: 4 }}>
                    <Card withBorder radius="md" p="md">
                      <Group justify="space-between" mb="xs">
                        <Text fw={500} lineClamp={1}>{session.title}</Text>
                        <ActionIcon variant="subtle">
                          <Heart size={16} />
                        </ActionIcon>
                      </Group>
                      <Group mb="xs">
                        <Avatar src={session.instructor.avatar} size="sm" radius="xl" />
                        <div>
                          <Text size="sm">{session.instructor.name}</Text>
                          <Group gap={4}>
                            <Star size={12} fill="#FFD700" color="#FFD700" />
                            <Text size="xs">{session.instructor.rating.toFixed(1)}</Text>
                          </Group>
                        </div>
                      </Group>
                      <Group mb="xs">
                        <Badge color="blue">{session.subject}</Badge>
                        <Badge color="green">{session.level}</Badge>
                      </Group>
                      <Group justify="space-between" mb="xs">
                        <Text size="sm">
                          <Clock size={14} style={{ display: "inline", marginRight: 5 }} />
                          {session.duration} min
                        </Text>
                        <Text size="sm" fw={500} c="blue">
                          ${session.price}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          <Users size={14} style={{ display: "inline", marginRight: 5 }} />
                          {session.students} enrolled
                        </Text>
                        <Button variant="light" size="xs" rightSection={<ArrowUpRight size={14} />}>
                          View
                        </Button>
                      </Group>
                    </Card>
                  </Grid.Col>
                ))}
                <Grid.Col span={12}>
                  <Button 
                    component={Link} 
                    href="/sessions/explore" 
                    variant="subtle" 
                    rightSection={<ArrowUpRight size={16} />}
                  >
                    Browse more sessions
                  </Button>
                </Grid.Col>
              </Grid>
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="my-sessions">
            <Box pt="md">
              <Title order={3} mb="md">My Enrolled Sessions</Title>
              
              <Grid>
                {enrolledSessions.map((session) => (
                  <Grid.Col key={session.id} span={{ base: 12, md: 6 }}>
                    <Card withBorder radius="md" p="md">
                      <Group justify="space-between" mb="xs">
                        <Text fw={500}>{session.title}</Text>
                        <StatusBadge status={session.status} />
                      </Group>
                      <Group mb="xs">
                        <Avatar src={session.instructor.avatar} size="sm" radius="xl" />
                        <div>
                          <Text size="sm">{session.instructor.name}</Text>
                          <Group spacing={4}>
                            <Star size={12} fill="#FFD700" color="#FFD700" />
                            <Text size="xs">{session.instructor.rating.toFixed(1)}</Text>
                          </Group>
                        </div>
                      </Group>
                      <Group mb="xs">
                        <Badge color="blue">{session.subject}</Badge>
                        <Badge color="green">{session.level}</Badge>
                      </Group>
                      <Text size="sm" c="dimmed" mb="md">
                        <Calendar size={14} style={{ display: "inline", marginRight: 5 }} />
                        Next session: {session.nextSession}
                      </Text>
                      <Progress 
                        value={(session.completedLessons / session.totalLessons) * 100} 
                        size="sm" 
                        radius="xs" 
                        mb="xs"
                      />
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          {session.completedLessons} of {session.totalLessons} lessons completed
                        </Text>
                        <Group>
                          <Button 
                            component={Link} 
                            href={`/sessions/${session.id}`} 
                            variant="light" 
                            size="xs"
                          >
                            Resources
                          </Button>
                          <Button 
                            component={Link} 
                            href={`/sessions/${session.id}`} 
                            variant="filled" 
                            size="xs" 
                            leftSection={<Video size={14} />}
                          >
                            Join
                          </Button>
                        </Group>
                      </Group>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
              
              {enrolledSessions.length === 0 && (
                <Paper p="lg" radius="md" withBorder>
                  <Text ta="center" mb="md">You're not enrolled in any sessions yet.</Text>
                  <Button 
                    component={Link} 
                    href="/sessions/explore" 
                    mx="auto" 
                    display="block"
                    leftSection={<Search size={18} />}
                  >
                    Find Sessions to Join
                  </Button>
                </Paper>
              )}
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="achievements">
            <Box pt="md">
              <Title order={3} mb="md">Your Learning Achievements</Title>
              
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper p="md" radius="md" withBorder>
                    <Title order={4} mb="lg">Learning Stats</Title>
                    <Grid>
                      <Grid.Col span={6}>
                        <Text fw={700} size="xl" ta="center">{achievementStats.totalSessions}</Text>
                        <Text ta="center" size="sm">Sessions Attended</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text fw={700} size="xl" ta="center">{achievementStats.hoursLearned}</Text>
                        <Text ta="center" size="sm">Hours Learned</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text fw={700} size="xl" ta="center">{achievementStats.subjectsCovered}</Text>
                        <Text ta="center" size="sm">Subjects Covered</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text fw={700} size="xl" ta="center">{achievementStats.streak}</Text>
                        <Text ta="center" size="sm">Day Streak</Text>
                      </Grid.Col>
                    </Grid>
                  </Paper>
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper p="md" radius="md" withBorder h="100%">
                    <Title order={4} mb="lg">Completed Subjects</Title>
                    <Box ta="center">
                      <Text>Subject completion badges will appear here</Text>
                      <Text size="sm" c="dimmed" mt="md">
                        Complete all sessions in a subject to earn a badge
                      </Text>
                    </Box>
                  </Paper>
                </Grid.Col>
                
                <Grid.Col span={12}>
                  <Paper p="md" radius="md" withBorder>
                    <Title order={4} mb="lg">Learning Journey</Title>
                    <Text ta="center">
                      Your learning timeline will be shown here as you progress through your courses.
                    </Text>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Box>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
} 