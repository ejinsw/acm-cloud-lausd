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
  Avatar,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Sparkles, History, Star, AlertCircle } from "lucide-react";
import { ProgressOverview } from "@/components/dashboard/student/ProgressOverview";
import { StatsGrid } from "@/components/dashboard/student/StatsGrid";
import { SessionHistoryTab, PastSession } from "@/components/dashboard/student/SessionHistoryTab";
import PageWrapper from "@/components/PageWrapper";
import { useAuth } from "@/components/AuthProvider";
import { Session, SessionHistoryItem, Review } from "@/lib/types";
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
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
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

  // Fetch session history
  const fetchSessionHistory = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/session-history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch session history');
      }

      const data = await response.json();
      setSessionHistory(data.sessions || []);
    } catch (err) {
      console.error('Error fetching session history:', err);
      // Don't set error here as it's not critical for the dashboard
    }
  };

  const fetchReviews = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/reviews`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
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
          fetchSessionHistory(),
          fetchReviews(),
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
    setRating(session.relatedReview?.rating || 0);
    setReview(session.relatedReview?.comment || "");
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
            sessionHistoryItemId: sessionToReview.id,
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
      await Promise.all([
        fetchUserSessions(),
        fetchSessionHistory(),
      ]);
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

  const formatReviewDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
            <Text c="dimmed">Track your learning progress and feedback</Text>
          </div>
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<Sparkles size={16} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="history" leftSection={<History size={16} />}>
              Session History ({sessionHistory.length})
            </Tabs.Tab>
            <Tabs.Tab value="reviews" leftSection={<Star size={16} />}>
              Reviews ({reviews.length})
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
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="history">
            <Box pt="md">
              <SessionHistoryTab 
                sessionHistory={sessionHistory} 
                onReviewClick={handleOpenReviewModal}
              />
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="reviews">
            <Box pt="md">
              {reviews.length === 0 ? (
                <Paper withBorder radius="md" p="xl" ta="center">
                  <Text fw={500} size="lg" mb="xs">
                    No reviews yet
                  </Text>
                  <Text size="sm" c="dimmed">
                    Once you leave reviews for your sessions, they will appear here.
                  </Text>
                </Paper>
              ) : (
                <Stack gap="md">
                  {reviews.map((review) => (
                    <Paper key={review.id} withBorder radius="md" p="md">
                      <Group justify="space-between" align="flex-start">
                        <Group align="center">
                          <Avatar color="blue">
                            {review.recipient?.firstName?.charAt(0)}
                            {review.recipient?.lastName?.charAt(0)}
                          </Avatar>
                          <div>
                            <Text fw={600}>
                              Reviewing{" "}
                              {review.recipient
                                ? `${review.recipient.firstName} ${review.recipient.lastName}`
                                : "Instructor"}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {formatReviewDate(review.createdAt)}
                            </Text>
                          </div>
                        </Group>
                        <Rating value={review.rating} readOnly fractions={2} />
                      </Group>

                      {review.sessionHistoryItem?.name && (
                        <Text size="sm" c="dimmed" mt="xs">
                          Session: {review.sessionHistoryItem.name}
                        </Text>
                      )}

                      {review.comment && (
                        <Text mt="md" size="sm">
                          {review.comment}
                        </Text>
                      )}
                    </Paper>
                  ))}
                </Stack>
              )}
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