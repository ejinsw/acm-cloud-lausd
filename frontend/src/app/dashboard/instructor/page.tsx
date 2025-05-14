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
  Menu,
  Modal,
  Box,
  Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Trash,
  Users,
  Video,
  ArrowUpRight,
  BookOpen,
  Sparkles,
  Star,
} from "lucide-react";

// Mock data
const mockSessions = [
  {
    id: "1",
    title: "Algebra Fundamentals",
    description: "Master algebra basics with a focus on equations and inequalities",
    subject: "Mathematics",
    level: "Beginner",
    sessions: 12,
    students: 8,
    price: 25,
    duration: 60,
    lastUpdated: "2023-10-15",
    status: "active",
    upcomingSessions: 3,
    completedSessions: 9,
    rating: 4.7,
    totalRevenue: 3600,
  },
  {
    id: "2",
    title: "Advanced Calculus",
    description: "Deep dive into differential equations and advanced calculus concepts",
    subject: "Mathematics",
    level: "Advanced",
    sessions: 8,
    students: 5,
    price: 35,
    duration: 90,
    lastUpdated: "2023-09-28",
    status: "active",
    upcomingSessions: 2,
    completedSessions: 6,
    rating: 4.8,
    totalRevenue: 2800,
  },
  {
    id: "3",
    title: "Spanish for Beginners",
    description: "Introduction to Spanish language and basic conversation skills",
    subject: "Languages",
    level: "Beginner",
    sessions: 15,
    students: 12,
    price: 20,
    duration: 45,
    lastUpdated: "2023-10-05",
    status: "active",
    upcomingSessions: 5,
    completedSessions: 10,
    rating: 4.5,
    totalRevenue: 4800,
  },
  {
    id: "4",
    title: "Chemistry Lab Techniques",
    description: "Hands-on approach to learn essential laboratory techniques in chemistry",
    subject: "Science",
    level: "Intermediate",
    sessions: 6,
    students: 4,
    price: 30,
    duration: 120,
    lastUpdated: "2023-10-10",
    status: "draft",
    upcomingSessions: 0,
    completedSessions: 0,
    rating: 0,
    totalRevenue: 0,
  },
  {
    id: "5",
    title: "Essay Writing Workshop",
    description: "Learn to craft compelling essays for academic success",
    subject: "English",
    level: "Intermediate",
    sessions: 4,
    students: 7,
    price: 22,
    duration: 60,
    lastUpdated: "2023-09-20",
    status: "ended",
    upcomingSessions: 0,
    completedSessions: 4,
    rating: 4.2,
    totalRevenue: 1232,
  },
];

const revenueData = {
  totalRevenue: 12432,
  lastMonthRevenue: 3400,
  averageRating: 4.6,
  totalSessions: 45,
  totalStudents: 36,
  totalHours: 78,
};

const upcomingSchedule = [
  {
    id: "s1",
    sessionTitle: "Algebra Fundamentals",
    date: "Oct 20, 2023",
    time: "3:30 PM - 4:30 PM",
    students: 3,
  },
  {
    id: "s2",
    sessionTitle: "Spanish for Beginners",
    date: "Oct 21, 2023",
    time: "5:00 PM - 5:45 PM",
    students: 5,
  },
  {
    id: "s3",
    sessionTitle: "Advanced Calculus",
    date: "Oct 22, 2023",
    time: "4:00 PM - 5:30 PM",
    students: 2,
  },
];

function StatusBadge({ status }: { status: string }) {
  let color;
  let label;

  switch (status) {
    case "active":
      color = "green";
      label = "Active";
      break;
    case "draft":
      color = "gray";
      label = "Draft";
      break;
    case "ended":
      color = "red";
      label = "Ended";
      break;
    default:
      color = "blue";
      label = status;
  }

  return <Badge color={color}>{label}</Badge>;
}

export default function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState<string | null>("overview");
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const handleDelete = (sessionId: string) => {
    setSessionToDelete(sessionId);
    openDeleteModal();
  };

  const confirmDelete = () => {
    console.log(`Deleting session with ID: ${sessionToDelete}`);
    // In a real app, you would call an API to delete the session
    closeDeleteModal();
  };

  // Filter sessions by status
  const activeSessions = mockSessions.filter((session) => session.status === "active");
  const draftSessions = mockSessions.filter((session) => session.status === "draft");
  const endedSessions = mockSessions.filter((session) => session.status === "ended");

  return (
    <Container size="xl" py="xl">
      <Paper p="xl" radius="md" withBorder mb="xl">
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={2}>Instructor Dashboard</Title>
            <Text c="dimmed">Manage your tutoring sessions</Text>
          </div>
          <Button component={Link} href="/sessions/create" leftSection={<Plus size={18} />}>
            Create New Session
          </Button>
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<Sparkles size={16} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="sessions" leftSection={<BookOpen size={16} />}>
              My Sessions
            </Tabs.Tab>
            <Tabs.Tab value="schedule" leftSection={<Calendar size={16} />}>
              Schedule
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview">
            <Box pt="md">
              <Title order={3} mb="md">Dashboard Overview</Title>
              
              {/* Stats Cards */}
              <Grid mb="xl">
                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                  <Paper p="md" radius="md" withBorder h={130}>
                    <Text size="xs" c="dimmed" tt="uppercase">Total Students</Text>
                    <Title order={3} fw={700} mt="xs">{revenueData.totalStudents}</Title>
                    <Text size="sm" c="dimmed" mt="md">
                      Across {activeSessions.length} active sessions
                    </Text>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                  <Paper p="md" radius="md" withBorder h={130}>
                    <Text size="xs" c="dimmed" tt="uppercase">Hours Tutored</Text>
                    <Title order={3} fw={700} mt="xs">{revenueData.totalHours}</Title>
                    <Text size="sm" c="dimmed" mt="md">
                      Over {revenueData.totalSessions} sessions
                    </Text>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                  <Paper p="md" radius="md" withBorder h={130}>
                    <Text size="xs" c="dimmed" tt="uppercase">Average Rating</Text>
                    <Title order={3} fw={700} mt="xs">{revenueData.averageRating.toFixed(1)}</Title>
                    <Group mt="md">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < Math.round(revenueData.averageRating) ? "#FFD700" : "none"}
                          color={i < Math.round(revenueData.averageRating) ? "#FFD700" : "#CCC"}
                        />
                      ))}
                    </Group>
                  </Paper>
                </Grid.Col>
              </Grid>

              {/* Upcoming Schedule */}
              <Title order={4} mb="md">Upcoming Schedule</Title>
              <Grid mb="xl">
                {upcomingSchedule.map((item) => (
                  <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <Card withBorder radius="md" p="md">
                      <Group justify="space-between" mb="xs">
                        <Text fw={500}>{item.sessionTitle}</Text>
                        <ActionIcon variant="subtle" color="gray">
                          <Video size={16} />
                        </ActionIcon>
                      </Group>
                      <Text size="sm" c="dimmed" mb="md">
                        <Calendar size={14} style={{ display: "inline", marginRight: 5 }} />
                        {item.date}
                      </Text>
                      <Text size="sm" c="dimmed" mb="md">
                        <Clock size={14} style={{ display: "inline", marginRight: 5 }} />
                        {item.time}
                      </Text>
                      <Group>
                        <Badge leftSection={<Users size={12} />}>
                          {item.students} students
                        </Badge>
                        <Button 
                          component={Link} 
                          href="/sessions/my" 
                          variant="subtle" 
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

              {/* Recent Active Sessions */}
              <Title order={4} mb="md">Active Sessions</Title>
              <Grid>
                {activeSessions.slice(0, 3).map((session) => (
                  <Grid.Col key={session.id} span={{ base: 12, md: 6, lg: 4 }}>
                    <SessionCard 
                      session={session} 
                      onDelete={() => handleDelete(session.id)} 
                    />
                  </Grid.Col>
                ))}
                {activeSessions.length > 3 && (
                  <Grid.Col span={12}>
                    <Button 
                      variant="subtle" 
                      onClick={() => setActiveTab("sessions")}
                      rightSection={<ArrowUpRight size={16} />}
                    >
                      View all {activeSessions.length} active sessions
                    </Button>
                  </Grid.Col>
                )}
              </Grid>
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="sessions">
            <Tabs defaultValue="active">
              <Tabs.List mb="md">
                <Tabs.Tab 
                  value="active" 
                  rightSection={<Badge size="xs">{activeSessions.length}</Badge>}
                >
                  Active
                </Tabs.Tab>
                <Tabs.Tab 
                  value="draft" 
                  rightSection={<Badge size="xs">{draftSessions.length}</Badge>}
                >
                  Draft
                </Tabs.Tab>
                <Tabs.Tab 
                  value="ended" 
                  rightSection={<Badge size="xs">{endedSessions.length}</Badge>}
                >
                  Ended
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="active">
                <Grid>
                  {activeSessions.map((session) => (
                    <Grid.Col key={session.id} span={{ base: 12, md: 6, lg: 4 }}>
                      <SessionCard 
                        session={session} 
                        onDelete={() => handleDelete(session.id)} 
                      />
                    </Grid.Col>
                  ))}
                </Grid>
              </Tabs.Panel>

              <Tabs.Panel value="draft">
                <Grid>
                  {draftSessions.map((session) => (
                    <Grid.Col key={session.id} span={{ base: 12, md: 6, lg: 4 }}>
                      <SessionCard 
                        session={session} 
                        onDelete={() => handleDelete(session.id)} 
                      />
                    </Grid.Col>
                  ))}
                </Grid>
              </Tabs.Panel>

              <Tabs.Panel value="ended">
                <Grid>
                  {endedSessions.map((session) => (
                    <Grid.Col key={session.id} span={{ base: 12, md: 6, lg: 4 }}>
                      <SessionCard 
                        session={session} 
                        onDelete={() => handleDelete(session.id)} 
                      />
                    </Grid.Col>
                  ))}
                </Grid>
              </Tabs.Panel>
            </Tabs>
          </Tabs.Panel>

          <Tabs.Panel value="schedule">
            <Box pt="md">
              <Title order={3} mb="md">Weekly Schedule</Title>
              <Text>
                Calendar view will be implemented in a future update. For now, you can view your upcoming sessions.
              </Text>
              
              <Divider my="lg" />
              
              <Title order={4} mb="md">Upcoming Sessions</Title>
              <Grid>
                {upcomingSchedule.map((item) => (
                  <Grid.Col key={item.id} span={{ base: 12, md: 6 }}>
                    <Card withBorder radius="md" p="md">
                      <Group justify="space-between" mb="xs">
                        <Text fw={500}>{item.sessionTitle}</Text>
                        <Badge>Upcoming</Badge>
                      </Group>
                      <Text size="sm" c="dimmed" mb="md">
                        <Calendar size={14} style={{ display: "inline", marginRight: 5 }} />
                        {item.date}
                      </Text>
                      <Text size="sm" c="dimmed" mb="md">
                        <Clock size={14} style={{ display: "inline", marginRight: 5 }} />
                        {item.time}
                      </Text>
                      <Group justify="space-between">
                        <Badge leftSection={<Users size={12} />}>
                          {item.students} students
                        </Badge>
                        <Group>
                          <Button 
                            component={Link} 
                            href="/sessions/my" 
                            variant="subtle" 
                            size="sm"
                          >
                            Details
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            color="blue"
                            leftSection={<Video size={14} />}
                          >
                            Start
                          </Button>
                        </Group>
                      </Group>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            </Box>
          </Tabs.Panel>
        </Tabs>
      </Paper>
      
      {/* Delete Confirmation Modal */}
      <Modal 
        opened={deleteModalOpened} 
        onClose={closeDeleteModal}
        title="Delete Session"
        centered
      >
        <Text mb="lg">
          Are you sure you want to delete this session? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="outline" onClick={closeDeleteModal}>Cancel</Button>
          <Button color="red" onClick={confirmDelete}>Delete</Button>
        </Group>
      </Modal>
    </Container>
  );
}

interface SessionCardProps {
  session: typeof mockSessions[0];
  onDelete: () => void;
}

function SessionCard({ session, onDelete }: SessionCardProps) {
  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb="xs">
        <Text fw={500}>{session.title}</Text>
        <Group gap="xs">
          <StatusBadge status={session.status} />
          <Menu position="bottom-end" shadow="md">
            <Menu.Target>
              <ActionIcon variant="subtle">
                <MoreHorizontal size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item 
                leftSection={<Eye size={14} />}
                component={Link}
                href={`/sessions/${session.id}`}
              >
                View Details
              </Menu.Item>
              <Menu.Item 
                leftSection={<Edit size={14} />}
                component={Link}
                href={`/sessions/edit/${session.id}`}
              >
                Edit Session
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                leftSection={<Trash size={14} />}
                color="red"
                onClick={onDelete}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
      
      <Text size="sm" c="dimmed" mb="md" lineClamp={2}>
        {session.description}
      </Text>
      
      <Group mb="xs">
        <Badge color="blue">{session.subject}</Badge>
        <Badge color="green">{session.level}</Badge>
      </Group>
      
      <Group mb="xs" justify="space-between">
        <Group gap="xs">
          <Text size="sm" c="dimmed">Duration:</Text>
          <Text size="sm">{session.duration} min</Text>
        </Group>
      </Group>
      
      <Group mb="xs" justify="space-between">
        <Group gap="xs">
          <Text size="sm" c="dimmed">Students:</Text>
          <Text size="sm">{session.students}</Text>
        </Group>
        <Group gap="xs">
          <Text size="sm" c="dimmed">Sessions:</Text>
          <Text size="sm">{session.sessions}</Text>
        </Group>
      </Group>
      
      {session.status === "active" && (
        <Group mt="md" justify="flex-end">
          <Button variant="light" size="xs" component={Link} href="/sessions/my">
            Manage
          </Button>
        </Group>
      )}
      
      {session.status === "draft" && (
        <Group mt="md" justify="flex-end">
          <Button variant="light" size="xs" component={Link} href={`/sessions/edit/${session.id}`}>
            Continue Editing
          </Button>
          <Button variant="filled" size="xs">
            Publish
          </Button>
        </Group>
      )}
    </Card>
  );
} 