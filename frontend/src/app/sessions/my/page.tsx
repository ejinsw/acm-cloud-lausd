"use client";

import { useState } from "react";
import { 
  Container, 
  Title, 
  Tabs, 
  Card, 
  Group, 
  Avatar,
  Text, 
  Badge, 
  Button, 
  Grid,
  Modal,
  Textarea,
  Rating,
  Flex,
  Divider,
  Progress,
  Box
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Star, 
  Video, 
  X
} from "lucide-react";
import Link from "next/link";

// Mock data
const upcomingSessions = [
  {
    id: 201,
    title: "Algebra Fundamentals",
    date: "2023-06-18T14:00:00",
    duration: 60,
    instructor: {
      id: 101,
      name: "Dr. Alex Johnson",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 4.8,
    },
    subject: "Mathematics",
    status: "confirmed",
    joinUrl: "#",
  },
  {
    id: 202,
    title: "Creative Writing Workshop",
    date: "2023-06-20T16:30:00",
    duration: 90,
    instructor: {
      id: 102,
      name: "Sarah Williams",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 4.9,
    },
    subject: "English",
    status: "pending",
    joinUrl: "#",
  },
];

const pastSessions = [
  {
    id: 198,
    title: "Spanish Conversation Practice",
    date: "2023-06-10T14:00:00",
    duration: 60,
    instructor: {
      id: 104,
      name: "Elena Rodriguez",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
      rating: 5.0,
    },
    subject: "Foreign Languages",
    status: "completed",
    userRating: 5,
    userReview: "Amazing session! Elena was so helpful with my pronunciation.",
  },
  {
    id: 199,
    title: "Chemistry Help",
    date: "2023-06-05T15:30:00",
    duration: 75,
    instructor: {
      id: 103,
      name: "Prof. Michael Chen",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      rating: 4.7,
    },
    subject: "Science",
    status: "completed",
    userRating: 4,
    userReview: "Very knowledgeable instructor. Helped me understand complex concepts.",
  },
  {
    id: 200,
    title: "Essay Review",
    date: "2023-06-01T13:00:00",
    duration: 45,
    instructor: {
      id: 102,
      name: "Sarah Williams",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 4.9,
    },
    subject: "English",
    status: "completed",
    userRating: null,
    userReview: null,
  },
];

interface PastSession {
  id: number;
  title: string;
  date: string;
  duration: number;
  instructor: {
    id: number;
    name: string;
    avatar: string;
    rating: number;
  };
  subject: string;
  status: string;
  userRating: number | null;
  userReview: string | null;
}

export default function MySessionsPage() {
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  const [sessionToReview, setSessionToReview] = useState<PastSession | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  
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
  
  // Check if a session is happening now
  function isSessionNow(dateString: string, durationMinutes: number) {
    const sessionTime = new Date(dateString).getTime();
    const now = new Date().getTime();
    const endTime = sessionTime + (durationMinutes * 60 * 1000);
    
    return now >= sessionTime && now <= endTime;
  }
  
  // Get time remaining until session
  function getTimeUntilSession(dateString: string) {
    const sessionTime = new Date(dateString).getTime();
    const now = new Date().getTime();
    const diffMs = sessionTime - now;
    
    // If the session is in the past or happening now
    if (diffMs <= 0) return null;
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
    
    if (diffHours > 0) {
      return `in ${diffHours} hr${diffHours > 1 ? 's' : ''} ${diffMinutes} min`;
    }
    
    return `in ${diffMinutes} min`;
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
  
  // Handle opening the review modal
  function handleOpenReviewModal(session: PastSession) {
    setSessionToReview(session);
    setRating(session.userRating || 0);
    setReview(session.userReview || "");
    open();
  }
  
  // Handle submitting the review
  function handleSubmitReview() {
    console.log("Review submitted:", { 
      sessionId: sessionToReview?.id, 
      rating, 
      review 
    });
    
    // In a real app, we would make an API call here to save the review
    
    alert("Review submitted successfully!");
    close();
  }

  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="lg">My Sessions</Title>
      
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || "upcoming")} mb="xl">
        <Tabs.List>
          <Tabs.Tab value="upcoming" leftSection={<Calendar size={16} />}>
            Upcoming Sessions ({upcomingSessions.length})
          </Tabs.Tab>
          <Tabs.Tab value="past" leftSection={<BookOpen size={16} />}>
            Past Sessions ({pastSessions.length})
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
      
      {activeTab === "upcoming" && (
        <Grid>
          {upcomingSessions.length === 0 ? (
            <Grid.Col span={12}>
              <Card withBorder shadow="sm" p="xl" ta="center">
                <Text size="lg" fw={500} mb="md">You don&apos;t have any upcoming sessions</Text>
                <Button 
                  component={Link} 
                  href="/sessions/explore"
                  leftSection={<BookOpen size={16} />}
                >
                  Explore Available Sessions
                </Button>
              </Card>
            </Grid.Col>
          ) : (
            upcomingSessions.map((session) => (
              <Grid.Col key={session.id} span={{ base: 12, md: 6 }}>
                <Card withBorder shadow="sm" radius="md" p="lg">
                  <Group mb="md">
                    <Avatar src={session.instructor.avatar} size="lg" radius="xl" />
                    <div>
                      <Text fw={500}>{session.instructor.name}</Text>
                      <Group gap={5}>
                        <Star size={14} className="text-yellow-500" fill="currentColor" />
                        <Text size="sm">{session.instructor.rating}/5</Text>
                      </Group>
                    </div>
                    <Badge color={getStatusColor(session.status)} ml="auto">
                      {session.status}
                    </Badge>
                  </Group>
                  
                  <Title order={3} size="h4" mb="xs">{session.title}</Title>
                  <Text c="dimmed" size="sm" mb="md">{session.subject}</Text>
                  
                  <Group mb="xs">
                    <Calendar size={16} />
                    <Text>{formatSessionDate(session.date)}</Text>
                  </Group>
                  
                  <Group mb="xs">
                    <Clock size={16} />
                    <Text>{session.duration} minutes</Text>
                  </Group>
                  
                  {isSessionNow(session.date, session.duration) ? (
                    <Button 
                      fullWidth 
                      mt="md"
                      color="green"
                      leftSection={<Video size={16} />}
                      component="a"
                      href={session.joinUrl}
                    >
                      Join Session Now
                    </Button>
                  ) : (
                    <Box>
                      <Group justify="space-between" mb={5}>
                        <Text size="sm" c="dimmed">Session starts {getTimeUntilSession(session.date)}</Text>
                        <Text size="sm" fw={500}>{getTimeUntilSession(session.date) ? "" : "Starting soon!"}</Text>
                      </Group>
                      <Progress
                        value={getTimeUntilSession(session.date) ? 80 : 95}
                        color={getTimeUntilSession(session.date) ? "blue" : "green"}
                        animated
                        striped
                        mb="md"
                      />
                      
                      <Group>
                        <Button 
                          variant="light" 
                          leftSection={<MessageSquare size={16} />}
                          component={Link}
                          href={`/sessions/${session.id}`}
                          style={{ flex: 1 }}
                        >
                          Message
                        </Button>
                        <Button 
                          variant="light" 
                          color="red"
                          leftSection={<X size={16} />}
                          style={{ flex: 1 }}
                        >
                          Cancel
                        </Button>
                      </Group>
                    </Box>
                  )}
                </Card>
              </Grid.Col>
            ))
          )}
        </Grid>
      )}
      
      {activeTab === "past" && (
        <Grid>
          {pastSessions.length === 0 ? (
            <Grid.Col span={12}>
              <Card withBorder shadow="sm" p="xl" ta="center">
                <Text size="lg" fw={500} mb="md">You haven&apos;t attended any sessions yet</Text>
                <Button 
                  component={Link} 
                  href="/sessions/explore"
                  leftSection={<BookOpen size={16} />}
                >
                  Explore Available Sessions
                </Button>
              </Card>
            </Grid.Col>
          ) : (
            pastSessions.map((session) => (
              <Grid.Col key={session.id} span={{ base: 12, md: 6 }}>
                <Card withBorder shadow="sm" radius="md" p="lg">
                  <Group mb="md">
                    <Avatar src={session.instructor.avatar} size="lg" radius="xl" />
                    <div>
                      <Text fw={500}>{session.instructor.name}</Text>
                      <Group gap={5}>
                        <Star size={14} className="text-yellow-500" fill="currentColor" />
                        <Text size="sm">{session.instructor.rating}/5</Text>
                      </Group>
                    </div>
                    <Badge color={getStatusColor(session.status)} ml="auto">
                      {session.status}
                    </Badge>
                  </Group>
                  
                  <Title order={3} size="h4" mb="xs">{session.title}</Title>
                  <Text c="dimmed" size="sm" mb="md">{session.subject}</Text>
                  
                  <Group mb="xs">
                    <Calendar size={16} />
                    <Text>{formatSessionDate(session.date)}</Text>
                  </Group>
                  
                  <Group mb="xs">
                    <Clock size={16} />
                    <Text>{session.duration} minutes</Text>
                  </Group>
                  
                  <Divider my="md" />
                  
                  {session.userRating ? (
                    <Box>
                      <Group mb="xs">
                        <Text fw={500}>Your Rating:</Text>
                        <Rating value={session.userRating} readOnly />
                      </Group>
                      {session.userReview && (
                        <Box>
                          <Text fw={500} mb="xs">Your Review:</Text>
                          <Text size="sm">{session.userReview}</Text>
                        </Box>
                      )}
                      <Button 
                        variant="subtle" 
                        mt="md"
                        onClick={() => handleOpenReviewModal(session)}
                      >
                        Edit Review
                      </Button>
                    </Box>
                  ) : (
                    <Flex direction="column" align="center">
                      <Text fw={500} mb="md">How was your session?</Text>
                      <Button 
                        leftSection={<Star size={16} />}
                        onClick={() => handleOpenReviewModal(session)}
                      >
                        Leave a Review
                      </Button>
                    </Flex>
                  )}
                </Card>
              </Grid.Col>
            ))
          )}
        </Grid>
      )}
      
      {/* Review Modal */}
      <Modal 
        opened={opened} 
        onClose={close} 
        title="Session Review" 
        centered
      >
        {sessionToReview && (
          <>
            <Group mb="md">
              <Avatar src={sessionToReview.instructor.avatar} radius="xl" />
              <div>
                <Text fw={500}>
                  {sessionToReview.title} with {sessionToReview.instructor.name}
                </Text>
                <Text size="sm" c="dimmed">
                  {formatSessionDate(sessionToReview.date)}
                </Text>
              </div>
            </Group>
            
            <Text fw={500} mb="xs">Rate this session:</Text>
            <Rating value={rating} onChange={setRating} size="xl" mb="md" />
            
            <Textarea
              label="Your review (optional)"
              placeholder="Share your experience with this tutor..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              minRows={3}
              mb="xl"
            />
            
            <Group justify="flex-end">
              <Button variant="subtle" onClick={close}>Cancel</Button>
              <Button 
                onClick={handleSubmitReview}
                leftSection={<CheckCircle size={16} />}
                disabled={rating === 0}
              >
                Submit Review
              </Button>
            </Group>
          </>
        )}
      </Modal>
    </Container>
  );
} 