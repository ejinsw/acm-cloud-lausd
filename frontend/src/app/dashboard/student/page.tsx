"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Title,
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
  Divider,
  Center,
  Card,
  SimpleGrid,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Sparkles, History, Star, AlertCircle, Clock3, ArrowRight, BookOpenText } from "lucide-react";
import { ProgressOverview } from "@/components/dashboard/student/ProgressOverview";
import { StatsGrid } from "@/components/dashboard/student/StatsGrid";
import { SessionsByWeekChart } from "@/components/dashboard/student/SessionsByWeekChart";
import { UnreviewedSessions } from "@/components/dashboard/student/UnreviewedSessions";
import { SessionHistoryTab, PastSession } from "@/components/dashboard/student/SessionHistoryTab";
import PageWrapper from "@/components/PageWrapper";
import { useAuth } from "@/components/AuthProvider";
import { Session, SessionHistoryItem, Review } from "@/lib/types";
import { getToken } from "@/actions/authentication";
import Link from "next/link";

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
  const activeSessions = sessions.filter((session) => session.status === "IN_PROGRESS");
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
  const reviewCount = reviews.length;

  // Calculate completion percentage for all courses
  const totalLessons = activeSessions.length + completedSessions.length;
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
      <Box py="xl">
        <Center py="xl" h={360}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading your dashboard...</Text>
          </Stack>
        </Center>
      </Box>
    );
  }

  if (error) {
    return (
      <Box py="xl">
        <Alert icon={<AlertCircle size={16} />} title="Error" color="red">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box py="lg" className="app-page-grid">
      <Card className="app-glass" p="xl">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Stack gap={8}>
            <Group gap="xs">
              <ThemeIcon size={28} radius="xl" color="blue" variant="light">
                <Sparkles size={16} />
              </ThemeIcon>
              <Text fw={600} c="blue.7">
                Today
              </Text>
            </Group>
            <Title order={2}>Welcome back{user?.firstName ? `, ${user.firstName}` : ""}</Title>
            <Text c="dimmed">
              You have {activeSessions.length} active sessions and {sessionHistory.length} completed sessions.
            </Text>
            <Group>
              <Button component={Link} href="/queue/join" rightSection={<ArrowRight size={16} />}>
                Join Queue
              </Button>
              <Button component={Link} href="/history" variant="subtle">
                View History
              </Button>
            </Group>
          </Stack>
          <Stack gap="sm">
            <Text fw={600}>Active Sessions</Text>
            {activeSessions.slice(0, 3).length === 0 ? (
              <Text size="sm" c="dimmed">
                No active sessions right now.
              </Text>
            ) : (
              activeSessions.slice(0, 3).map((session) => (
                <Card key={session.id} withBorder p="sm">
                  <Group justify="space-between" wrap="nowrap">
                    <Stack gap={2} style={{ flex: 1 }}>
                      <Text fw={600} size="sm">
                        {session.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {session.startTime
                          ? new Date(session.startTime).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Time TBD"}
                      </Text>
                    </Stack>
                    <ThemeIcon variant="light" color="yellow" radius="xl" size="md">
                      <Clock3 size={14} />
                    </ThemeIcon>
                  </Group>
                </Card>
              ))
            )}
          </Stack>
        </SimpleGrid>
      </Card>

      <Box>
        <Group justify="space-between" align="center" mb="sm">
          <Group gap="xs">
            <BookOpenText size={18} />
            <Text fw={600}>Learning Workspace</Text>
          </Group>
        </Group>
      </Box>

      <Tabs value={activeTab} onChange={setActiveTab}>
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

        <Tabs.Panel value="overview" pt="lg">
          <ProgressOverview
            completedLessons={completedSessions.length}
            totalLessons={totalLessons}
            overallProgress={overallProgress}
          />
          <StatsGrid
            totalSessions={totalSessions}
            hoursLearned={hoursLearned}
            reviewCount={reviewCount}
          />
          <SessionsByWeekChart sessionHistory={sessionHistory} />
          <UnreviewedSessions
            sessionHistory={sessionHistory as PastSession[]}
            onReviewClick={handleOpenReviewModal}
          />
        </Tabs.Panel>

        <Tabs.Panel value="history" pt="lg">
          <SessionHistoryTab 
            sessionHistory={sessionHistory} 
            onReviewClick={handleOpenReviewModal}
          />
        </Tabs.Panel>

        <Tabs.Panel value="reviews" pt="lg">
          {reviews.length === 0 ? (
            <Box py="xl" ta="center">
              <Text fw={500} size="lg" mb="xs">No reviews yet</Text>
              <Text size="sm" c="dimmed">
                Once you leave reviews for your sessions, they will appear here.
              </Text>
            </Box>
          ) : (
            <Stack gap={0}>
              {reviews.map((review, index) => (
                <Box key={review.id}>
                  {index > 0 && <Divider />}
                  <Box py="lg">
                    <Group justify="space-between" align="flex-start">
                      <Group align="center">
                        <Avatar color="blue" size="sm">
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
                      <Rating value={review.rating} readOnly fractions={2} size="sm" />
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
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Tabs.Panel>
      </Tabs>

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
    </Box>
  );
}

export default function StudentDashboard() {
  return (
    <PageWrapper>
      <StudentDashboardContent />
    </PageWrapper>
  );
} 
