"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Container,
  Title,
  Paper,
  Tabs,
  Text,
  Group,
  Box,
  Stack,
  Button,
  Modal,
  Textarea,
  Rating,
  Loader,
  Alert,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Search, Sparkles, GraduationCap, Calendar, BookOpen, AlertCircle } from "lucide-react";
import Link from "next/link";
import { routes } from "@/app/routes";
import { ProgressOverview } from "@/components/dashboard/student/ProgressOverview";
import { StatsGrid } from "@/components/dashboard/student/StatsGrid";
import { SessionHistoryTab, PastSession } from "@/components/dashboard/student/SessionHistoryTab";
import { UpcomingSessionsTab } from "@/components/dashboard/student/UpcomingSessionsTab";
import { SessionRequestsManager } from "@/components/dashboard/student/SessionRequestsManager";
import { AchievementsPanel } from "@/components/dashboard/student/AchievementsPanel";
import PageWrapper from "@/components/PageWrapper";
import { useAuth } from "@/components/AuthProvider";
import { Session, SessionRequest } from "@/lib/types";
import { getToken } from "@/actions/authentication";

function StudentDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sessionToReview, setSessionToReview] = useState<PastSession | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  
  // Data states
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionRequests, setSessionRequests] = useState<SessionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get initial tab from URL or default to "overview"
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState<string | null>(initialTab);

  // Fetch user sessions
  const fetchUserSessions = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/sessions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions');
    }
  };

  // Fetch session requests from user data
  const fetchSessionRequests = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/session-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch session requests');
      }

      const data = await response.json();
      setSessionRequests(data.sessionRequests || []);
    } catch (err) {
      console.error('Error fetching session requests:', err);
      // Don't set error here as it's not critical for the dashboard
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchUserSessions(),
          fetchSessionRequests(),
        ]);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Update session requests when user data changes
  useEffect(() => {
    fetchSessionRequests();
  }, [user?.sessionRequests]);

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", activeTab);
      router.push(`?${params.toString()}`);
    }
  }, [activeTab, router, searchParams]);

  // Calculate statistics
  const upcomingSessions = sessions.filter(session => 
    session.status === 'SCHEDULED' || session.status === 'IN_PROGRESS'
  );
  const completedSessions = sessions.filter(session => 
    session.status === 'COMPLETED'
  );
  const totalSessions = sessions.length;
  const hoursLearned = Math.round(completedSessions.reduce((total, session) => {
    if (session.startTime && session.endTime) {
      const start = new Date(session.startTime).getTime();
      const end = new Date(session.endTime).getTime();
      return total + (end - start) / (1000 * 60 * 60); // Convert to hours
    }
    return total;
  }, 0));
  const subjectsCovered = new Set(
    sessions.flatMap(session => 
      session.subjects?.map(subject => subject.name) || []
    )
  ).size;
  const streak = Math.min(completedSessions.length, 30); // Mock streak calculation

  const achievementStats = {
    totalSessions,
    hoursLearned,
    subjectsCovered,
    streak,
  };

  // Calculate completion percentage for all courses
  const totalLessons = upcomingSessions.length + completedSessions.length;
  const overallProgress = totalLessons > 0 ? Math.round((completedSessions.length / totalLessons) * 100) : 0;

  // Handle opening the review modal
  function handleOpenReviewModal(session: PastSession) {
    setSessionToReview(session);
    setRating(session.userRating || 0);
    setReview(session.userReview || "");
    open();
  }
  
  // Handle submitting the review
  async function handleSubmitReview() {
    if (!sessionToReview) return;

    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating,
            comment: review,
            instructorId: sessionToReview.instructorId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      notifications.show({
        title: "Review Submitted",
        message: `Your review for ${sessionToReview.name} has been saved successfully!`,
        color: "green",
      });
      
      // Refresh data
      await fetchUserSessions();
      close();
    } catch (err) {
      console.error('Error submitting review:', err);
      notifications.show({
        title: "Error",
        message: "Failed to submit review. Please try again.",
        color: "red",
      });
    }
  }

  // Handle session requests change
  const handleSessionRequestsChange = () => {
    fetchSessionRequests();
  };

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <Paper p="xl" radius="md" withBorder>
          <Box ta="center" py="xl">
            <Loader size="lg" />
            <Text mt="md">Loading your dashboard...</Text>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Paper p="xl" radius="md" withBorder>
          <Alert icon={<AlertCircle size={16} />} title="Error" color="red">
            {error}
          </Alert>
        </Paper>
      </Container>
    );
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
            <Tabs.Tab value="requests" leftSection={<BookOpen size={16} />}>
              Session Requests ({sessionRequests.length})
            </Tabs.Tab>
            <Tabs.Tab value="history" leftSection={<BookOpen size={16} />}>
              Session History ({completedSessions.length})
            </Tabs.Tab>
            <Tabs.Tab value="achievements" leftSection={<GraduationCap size={16} />}>
              Achievements
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview">
            <Box pt="md">
              <ProgressOverview
                completedLessons={completedSessions.length}
                totalLessons={totalLessons}
                overallProgress={overallProgress}
              />
              
              <StatsGrid {...achievementStats} />
              
              <UpcomingSessionsTab sessions={sessions} />
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="sessions">
            <Box pt="md">
              <UpcomingSessionsTab sessions={sessions} />
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="requests">
            <Box pt="md">
              <SessionRequestsManager
                sessionRequests={sessionRequests}
                onSessionRequestsChange={handleSessionRequestsChange}
              />
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="history">
            <Box pt="md">
              <SessionHistoryTab 
                sessions={sessions} 
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

export default function StudentDashboard() {
  return (
    <PageWrapper>
      <StudentDashboardContent />
    </PageWrapper>
  );
} 