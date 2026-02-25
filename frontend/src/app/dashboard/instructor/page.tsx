"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Container,
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
} from "@mantine/core";
import { Search, Sparkles, AlertCircle, History, Video, Star } from "lucide-react";
import Link from "next/link";
import { routes } from "@/app/routes";
import { StatsGrid } from "@/components/dashboard/instructor/StatsGrid";
import { SessionHistoryTab } from "@/components/dashboard/student/SessionHistoryTab";
import ZoomConnection from "@/components/sessions/ZoomConnection";
import PageWrapper from "@/components/PageWrapper";
import { useAuth } from "@/components/AuthProvider";
import { Session, SessionHistoryItem, Review } from "@/lib/types";
import { getToken } from "@/actions/authentication";
import { useZoomStatus } from "@/hooks/useZoomStatus";
import { notifications } from "@mantine/notifications";

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

  // Check Zoom connection status
  const { connected: zoomConnected, expired: zoomExpired, isLoading: zoomLoading } = useZoomStatus();

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

  // Check for Zoom connection success
  useEffect(() => {
    const zoomConnected = searchParams.get('zoom_connected');
    if (zoomConnected === 'true') {
      notifications.show({
        title: 'Success',
        message: 'Zoom account connected successfully!',
        color: 'green',
      });
      // Clean up the URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('zoom_connected');
      router.replace(`?${params.toString()}`);
    }
  }, [searchParams, router]);

  // Calculate statistics
  const completedSessions = sessions.filter(
    (session) => session.status === "COMPLETED"
  );
  const totalSessions = sessions.length;
  const totalStudents = new Set(
    sessions.flatMap(
      (session) => session.students?.map((student) => student.id) || []
    )
  ).size;

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

  const averageRating = user?.averageRating || 0;

  const statsData = {
    totalStudents,
    hoursTutored,
    averageRating,
    totalSessions,
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

  // Handle session updates
  const handleSessionUpdate = () => {
    fetchInstructorSessions();
    fetchSessionHistory();
    fetchReviews();
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
      <Container size="xl" py="xl">
        <Center py="xl">
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading your dashboard...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<AlertCircle size={16} />} title="Error" color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Box pb="lg" mb="lg" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
        <Title order={2}>Instructor Dashboard</Title>
        <Text c="dimmed" mt="xs" size="sm">
          Manage your tutoring sessions and track your progress
        </Text>
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
            <Tabs.Tab value="zoom" leftSection={<Video size={16} />}>
              Zoom Integration
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="lg">
            {/* Zoom Connection Warning */}
            {!zoomLoading && (!zoomConnected || zoomExpired) && (
              <Alert
                icon={<Video size={20} />}
                color="yellow"
                title="Action Required: Connect Your Zoom Account"
                mb="xl"
              >
                <Stack gap="sm">
                  <Text size="sm">
                    {zoomExpired 
                      ? "Your Zoom connection has expired. You must reconnect your Zoom account to create sessions and accept queue requests."
                      : "You must connect your Zoom account before you can create sessions or accept queue requests. All tutoring sessions use Zoom for video meetings."
                    }
                  </Text>
                  <Button
                    leftSection={<Video size={16} />}
                    onClick={() => setActiveTab('zoom')}
                    size="sm"
                    style={{ width: 'fit-content' }}
                  >
                    {zoomExpired ? 'Reconnect Zoom Now' : 'Connect Zoom Now'}
                  </Button>
                </Stack>
              </Alert>
            )}
            <StatsGrid {...statsData} />
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

          <Tabs.Panel value="zoom" pt="lg">
            <ZoomConnection
              onConnected={handleSessionUpdate}
              onDisconnected={handleSessionUpdate}
            />
          </Tabs.Panel>
        </Tabs>
    </Container>
  );
}

export default function InstructorDashboard() {
  return (
    <PageWrapper>
      <InstructorDashboardContent />
    </PageWrapper>
  );
}
