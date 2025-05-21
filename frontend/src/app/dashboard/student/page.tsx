"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Container,
  Title,
  Paper,
  Tabs,
  Button,
  Text,
  Group,
  Box,
  Modal,
  Textarea,
  Rating,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { Search, Sparkles, GraduationCap, Calendar, BookOpen } from "lucide-react";
import { routes } from "@/app/routes";
import { ProgressOverview } from "@/components/dashboard/student/ProgressOverview";
import { StatsGrid } from "@/components/dashboard/student/StatsGrid";
import { UpcomingSessionsTab } from "@/components/dashboard/student/UpcomingSessionsTab";
import { SessionHistoryTab, PastSession } from "@/components/dashboard/student/SessionHistoryTab";
import { AchievementsPanel } from "@/components/dashboard/student/AchievementsPanel";

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

const achievementStats = {
  totalSessions: 12,
  hoursLearned: 18,
  subjectsCovered: 3,
  streak: 8,
};

export default function StudentDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sessionToReview, setSessionToReview] = useState<PastSession | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [opened, { open, close }] = useDisclosure(false);

  // Get initial tab from URL or default to "overview"
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState<string | null>(initialTab);

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", activeTab);
      router.push(`?${params.toString()}`);
    }
  }, [activeTab, router, searchParams]);

  // Calculate completion percentage for all courses
  const totalLessons = upcomingSessions.length;
  const completedLessons = pastSessions.length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

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
    notifications.show({
      title: "Review Submitted",
      message: `Your review for ${sessionToReview?.title} has been saved successfully!`,
      color: "green",
    });
    
    close();
  }

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
            href={routes.exploreSessions} 
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
            <Tabs.Tab value="sessions" leftSection={<Calendar size={16} />}>
              My Sessions ({upcomingSessions.length})
            </Tabs.Tab>
            <Tabs.Tab value="history" leftSection={<BookOpen size={16} />}>
              Session History ({pastSessions.length})
            </Tabs.Tab>
            <Tabs.Tab value="achievements" leftSection={<GraduationCap size={16} />}>
              Achievements
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview">
            <Box pt="md">
              <ProgressOverview
                completedLessons={completedLessons}
                totalLessons={totalLessons}
                overallProgress={overallProgress}
              />
              
              <StatsGrid {...achievementStats} />
              
              <UpcomingSessionsTab sessions={upcomingSessions} />
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="sessions">
            <Box pt="md">
              <UpcomingSessionsTab sessions={upcomingSessions} />
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="history">
            <Box pt="md">
              <SessionHistoryTab 
                sessions={pastSessions} 
                onReviewClick={handleOpenReviewModal}
              />
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="achievements">
            <Box pt="md">
              <AchievementsPanel {...achievementStats} />
            </Box>
          </Tabs.Panel>
        </Tabs>
      </Paper>

      <Modal opened={opened} onClose={close} title="Leave a Review" centered>
        <Stack>
          <Text size="sm">How would you rate your experience with this session?</Text>
          <Rating value={rating} onChange={setRating} />
          <Textarea
            label="Your Review"
            placeholder="Share your thoughts about the session..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            minRows={4}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={close}>Cancel</Button>
            <Button onClick={handleSubmitReview}>Submit Review</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
} 