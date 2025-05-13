"use client";

import { useState } from "react";
import { 
  Container, 
  Title, 
  Text, 
  Grid, 
  Card, 
  Group, 
  Avatar, 
  Badge, 
  Button, 
  Table,
  Tabs,
  Progress,
  ActionIcon,
  Select,
  Menu,
  SimpleGrid,
  RingProgress
} from "@mantine/core";
import Link from "next/link";
import { 
  ArrowUpRight,
  Calendar,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Star,
  Trash,
  Users
} from "lucide-react";

// Mock data
const instructorData = {
  name: "Dr. Alex Johnson",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  rating: 4.8,
  totalStudents: 124,
  totalSessions: 312,
  earnings: {
    thisMonth: 1250,
    lastMonth: 980,
    total: 8450
  },
  sessionsBySubject: [
    { subject: "Algebra", count: 45, color: "blue" },
    { subject: "Calculus", count: 32, color: "green" },
    { subject: "Statistics", count: 18, color: "yellow" },
    { subject: "Geometry", count: 14, color: "red" },
  ]
};

interface SessionBase {
  id: number;
  title: string;
  date: string;
  duration: number;
  studentName: string;
  studentAvatar: string;
  subject: string;
  status: string;
}

interface UpcomingSession extends SessionBase {
  status: 'confirmed' | 'pending';
}

interface CompletedSession extends SessionBase {
  status: 'completed';
  rating: number;
}

type Session = UpcomingSession | CompletedSession;

const upcomingSessions: UpcomingSession[] = [
  {
    id: 101,
    title: "Algebra Fundamentals",
    date: "2023-06-18T14:00:00",
    duration: 60,
    studentName: "Jamie Smith",
    studentAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
    subject: "Mathematics",
    status: "confirmed"
  },
  {
    id: 102,
    title: "Calculus Review",
    date: "2023-06-19T16:30:00",
    duration: 90,
    studentName: "Michael Brown",
    studentAvatar: "https://randomuser.me/api/portraits/men/43.jpg",
    subject: "Mathematics",
    status: "confirmed"
  },
  {
    id: 103,
    title: "Statistics Help",
    date: "2023-06-20T10:00:00",
    duration: 60,
    studentName: "Emily Wilson",
    studentAvatar: "https://randomuser.me/api/portraits/women/56.jpg",
    subject: "Mathematics",
    status: "pending"
  }
];

const pastSessions: CompletedSession[] = [
  {
    id: 98,
    title: "Algebra Fundamentals",
    date: "2023-06-10T14:00:00",
    duration: 60,
    studentName: "Sarah Johnson",
    studentAvatar: "https://randomuser.me/api/portraits/women/33.jpg",
    subject: "Mathematics",
    status: "completed",
    rating: 5
  },
  {
    id: 99,
    title: "Geometry Review",
    date: "2023-06-12T16:30:00",
    duration: 90,
    studentName: "Alex Thomas",
    studentAvatar: "https://randomuser.me/api/portraits/men/91.jpg",
    subject: "Mathematics",
    status: "completed",
    rating: 4
  },
  {
    id: 100,
    title: "Probability Help",
    date: "2023-06-15T10:00:00",
    duration: 60,
    studentName: "Jessica Williams",
    studentAvatar: "https://randomuser.me/api/portraits/women/12.jpg",
    subject: "Mathematics",
    status: "completed",
    rating: 5
  }
];

export default function InstructorDashboardPage() {
  const [activeTab, setActiveTab] = useState<string | null>("upcoming");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("This Month");
  
  // Format date for display
  function formatSessionDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Determine status badge color
  function getStatusColor(status: string) {
    switch(status) {
      case 'confirmed': return 'green';
      case 'pending': return 'yellow';
      case 'completed': return 'blue';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  }
  
  // Type guard to check if a session is completed
  function isCompletedSession(session: Session): session is CompletedSession {
    return session.status === 'completed';
  }

  return (
    <Container size="xl" py="xl">
      <Grid gutter="lg">
        {/* Instructor Profile Section */}
        <Grid.Col span={12}>
          <Card withBorder shadow="sm" p="lg" radius="md">
            <Group>
              <Avatar src={instructorData.avatar} size="xl" radius="xl" />
              <div>
                <Title order={2}>{instructorData.name}</Title>
                <Group gap={5}>
                  <Star size={16} className="text-yellow-500" fill="currentColor" />
                  <Text span fw={500}>{instructorData.rating}/5 Rating</Text>
                </Group>
                <Text c="dimmed" mt={5}>Mathematics Instructor</Text>
              </div>
              <Button ml="auto" leftSection={<Plus size={16} />} component={Link} href="/instructor/create-session">
                Create Session
              </Button>
            </Group>
          </Card>
        </Grid.Col>
        
        {/* Stats Overview Cards */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder shadow="sm" p="lg" radius="md">
            <Text c="dimmed" size="sm">Total Students</Text>
            <Group align="flex-end" gap="xs">
              <Text fw={700} size="xl">{instructorData.totalStudents}</Text>
              <Text c="teal" size="sm">+12% <ArrowUpRight size={14} /></Text>
            </Group>
            <Group mt="md">
              <Avatar.Group spacing="sm">
                <Avatar src="https://randomuser.me/api/portraits/men/43.jpg" radius="xl" size="sm" />
                <Avatar src="https://randomuser.me/api/portraits/women/22.jpg" radius="xl" size="sm" />
                <Avatar src="https://randomuser.me/api/portraits/women/56.jpg" radius="xl" size="sm" />
                <Avatar radius="xl" size="sm">+{instructorData.totalStudents - 3}</Avatar>
              </Avatar.Group>
            </Group>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder shadow="sm" p="lg" radius="md">
            <Text c="dimmed" size="sm">Total Sessions</Text>
            <Group align="flex-end" gap="xs">
              <Text fw={700} size="xl">{instructorData.totalSessions}</Text>
              <Text c="teal" size="sm">+8% <ArrowUpRight size={14} /></Text>
            </Group>
            <Text size="sm" mt="md">
              <Text span c="blue" fw={500}>{upcomingSessions.length}</Text> upcoming sessions
            </Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder shadow="sm" p="lg" radius="md">
            <Group justify="space-between">
              <Text c="dimmed" size="sm">Earnings</Text>
              <Select
                size="xs"
                value={selectedPeriod}
                onChange={(value) => setSelectedPeriod(value || "This Month")}
                data={["This Month", "Last Month", "Total"]}
                styles={{ input: { width: 110 } }}
              />
            </Group>
            <Text fw={700} size="xl" mt="xs">
              ${selectedPeriod === "This Month" 
                ? instructorData.earnings.thisMonth
                : selectedPeriod === "Last Month"
                  ? instructorData.earnings.lastMonth
                  : instructorData.earnings.total}
            </Text>
            {selectedPeriod === "This Month" && (
              <Text c="teal" size="sm" mt="md">
                +$270 from last month <ArrowUpRight size={14} />
              </Text>
            )}
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder shadow="sm" p="lg" radius="md">
            <Text c="dimmed" size="sm">Rating</Text>
            <Group align="flex-end" gap="xs">
              <Text fw={700} size="xl">{instructorData.rating}</Text>
              <Text c="dimmed" size="sm">/ 5</Text>
            </Group>
            <Group mt="md" justify="space-between">
              <Progress 
                value={instructorData.rating * 20} 
                size="sm" 
                color="yellow" 
                className="flex-1"
              />
              <Group gap={4}>
                <Star size={14} className="text-yellow-500" fill="currentColor" />
                <Text size="sm" fw={500}>52 reviews</Text>
              </Group>
            </Group>
          </Card>
        </Grid.Col>
        
        {/* Subject Distribution Chart */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder shadow="sm" p="lg" radius="md" h="100%">
            <Title order={3} mb="md">Sessions by Subject</Title>
            <SimpleGrid cols={2}>
              <div className="flex justify-center">
                <RingProgress
                  size={180}
                  thickness={20}
                  roundCaps
                  sections={instructorData.sessionsBySubject.map(item => ({
                    value: (item.count / instructorData.totalSessions) * 100,
                    color: item.color,
                  }))}
                  label={
                    <Text ta="center" fw={700} size="xl">
                      {instructorData.totalSessions}
                    </Text>
                  }
                />
              </div>
              <div>
                {instructorData.sessionsBySubject.map((item, i) => (
                  <Group key={i} mb="xs">
                    <div className={`w-3 h-3 rounded-full bg-${item.color}-500`} />
                    <Text size="sm">{item.subject}</Text>
                    <Text size="sm" fw={500} ml="auto">{Math.round((item.count / instructorData.totalSessions) * 100)}%</Text>
                  </Group>
                ))}
              </div>
            </SimpleGrid>
          </Card>
        </Grid.Col>
        
        {/* Sessions Management */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder shadow="sm" p="lg" radius="md">
            <Title order={3} mb="md">Your Sessions</Title>
            
            <Tabs value={activeTab} onChange={setActiveTab} mb="md">
              <Tabs.List>
                <Tabs.Tab value="upcoming" leftSection={<Calendar size={14} />}>
                  Upcoming ({upcomingSessions.length})
                </Tabs.Tab>
                <Tabs.Tab value="past" leftSection={<Users size={14} />}>
                  Past Sessions
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>
            
            <Table>
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Student</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === "upcoming" ? upcomingSessions : pastSessions).map((session) => (
                  <tr key={session.id}>
                    <td>
                      <Group gap="sm">
                        <div>
                          <Text size="sm" fw={500}>{session.title}</Text>
                          <Text size="xs" c="dimmed">{session.duration} minutes</Text>
                        </div>
                      </Group>
                    </td>
                    <td>
                      <Group gap="sm">
                        <Avatar src={session.studentAvatar} radius="xl" size="sm" />
                        <Text size="sm">{session.studentName}</Text>
                      </Group>
                    </td>
                    <td>
                      <Text size="sm">{formatSessionDate(session.date)}</Text>
                    </td>
                    <td>
                      <Badge color={getStatusColor(session.status)}>
                        {isCompletedSession(session) ? (
                          <Group gap={4}>
                            <span>{session.status}</span>
                            <Star size={12} fill="currentColor" />
                            <span>{session.rating}</span>
                          </Group>
                        ) : (
                          session.status
                        )}
                      </Badge>
                    </td>
                    <td>
                      <Group gap={5}>
                        {session.status === "confirmed" && (
                          <ActionIcon 
                            component={Link} 
                            href={`/sessions/${session.id}`}
                            variant="subtle" 
                            color="blue"
                          >
                            <Eye size={16} />
                          </ActionIcon>
                        )}
                        {(session.status === "pending" || session.status === "confirmed") && (
                          <Menu position="bottom-end" shadow="md">
                            <Menu.Target>
                              <ActionIcon variant="subtle">
                                <MoreHorizontal size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item leftSection={<Edit size={14} />}>
                                Edit Session
                              </Menu.Item>
                              {session.status === "pending" && (
                                <Menu.Item leftSection={<Calendar size={14} />} color="green">
                                  Confirm Session
                                </Menu.Item>
                              )}
                              <Menu.Item leftSection={<Trash size={14} />} color="red">
                                Cancel Session
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        )}
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            
            <Group justify="center" mt="lg">
              <Button variant="outline" component={Link} href="/instructor/sessions">
                View All Sessions
              </Button>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
} 