"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Title,
  Tabs,
  Text,
  Group,
  Box,
  Button,
  Loader,
  Alert,
  Stack,
  Avatar,
  Rating,
  Divider,
  Center,
  Card,
  SimpleGrid,
  ThemeIcon,
  Badge,
} from "@mantine/core";
import { Sparkles, AlertCircle, History, Star, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";
import { routes } from "@/app/routes";
import { StatsGrid } from "@/components/dashboard/instructor/StatsGrid";
import { SessionsByWeekChart } from "@/components/dashboard/student/SessionsByWeekChart";
import { UnreviewedSessions } from "@/components/dashboard/student/UnreviewedSessions";
import { SessionHistoryTab } from "@/components/dashboard/student/SessionHistoryTab";
import { PastSession } from "@/components/dashboard/student/SessionHistoryTab";
import PageWrapper from "@/components/PageWrapper";
import { useAuth } from "@/components/AuthProvider";
import { Session, SessionHistoryItem, Review } from "@/lib/types";
import { getToken } from "@/actions/authentication";

function InstructorDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Data states
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get initial tab from URL or default to "overview"
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState<string | null>(initialTab);

  // Fetch instructor sessions
  const fetchInstructorSessions = async () => {
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
        throw new Error("Failed to fetch sessions");
      }

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Failed to load sessions");
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await Promise.all([
          fetchInstructorSessions(),
          fetchSessionHistory(),
          fetchReviews(),
        ]);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Failed to load dashboard data");
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
  const completedSessions = sessions.filter(
    (session) => session.status === "COMPLETED"
  );
  const totalSessions = sessions.length;

  const hoursTutored = Math.round(
    completedSessions.reduce((total, session) => {
      if (session.startTime && session.endTime) {
        const start = new Date(session.startTime).getTime();
        const end = new Date(session.endTime).getTime();
        return total + (end - start) / (1000 * 60 * 60); // Convert to hours
      }
      return total;
    }, 0)
  );

  const reviewCount = reviews.length;

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
        throw new Error("Failed to fetch session history");
      }

      const data = await response.json();
      setSessionHistory(data.sessions || []);
    } catch (err) {
      console.error("Error fetching session history:", err);
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
                Instructor Workspace
              </Text>
            </Group>
            <Title order={2}>Welcome back{user?.firstName ? `, ${user.firstName}` : ""}</Title>
            <Text c="dimmed">
              {totalSessions} sessions total, {hoursTutored} hours taught, {reviews.length} feedback entries.
            </Text>
            <Group>
              <Button component={Link} href={routes.instructorQueue} rightSection={<ArrowRight size={16} />}>
                Open TutorDeck
              </Button>
              <Button component={Link} href={routes.history} variant="light">
                View History
              </Button>
            </Group>
          </Stack>
          <Card withBorder p="md">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text fw={600}>Live readiness</Text>
                <Badge color="green" variant="light">
                  Ready
                </Badge>
              </Group>
              <Group gap="xs">
                <Activity size={16} />
                <Text size="sm" c="dimmed">
                  Queue availability and live session controls are ready.
                </Text>
              </Group>
              <Alert color="green" variant="light">
                Accept requests in TutorDeck and share a meeting link directly in session settings.
              </Alert>
            </Stack>
          </Card>
        </SimpleGrid>
      </Card>

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
            <StatsGrid
              totalSessions={totalSessions}
              hoursTutored={hoursTutored}
              reviewCount={reviewCount}
            />
            <SessionsByWeekChart sessionHistory={sessionHistory} />
            <UnreviewedSessions
              sessionHistory={sessionHistory as PastSession[]}
              canReview={false}
            />
          </Tabs.Panel>

          <Tabs.Panel value="history" pt="lg">
            <SessionHistoryTab
              sessionHistory={sessionHistory}
              onReviewClick={() => {}}
            />
          </Tabs.Panel>

          <Tabs.Panel value="reviews" pt="lg">
            {reviews.length === 0 ? (
              <Box py="xl" ta="center">
                <Text fw={500} size="lg" mb="xs">No reviews yet</Text>
                <Text size="sm" c="dimmed">
                  Reviews from your students will appear here once they start leaving feedback.
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
                            {review.owner?.firstName?.charAt(0)}
                            {review.owner?.lastName?.charAt(0)}
                          </Avatar>
                          <div>
                            <Text fw={600}>
                              {review.owner
                                ? `${review.owner.firstName} ${review.owner.lastName}`
                                : "Student"}
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
    </Box>
  );
}

export default function InstructorDashboard() {
  return (
    <PageWrapper>
      <InstructorDashboardContent />
    </PageWrapper>
  );
}
