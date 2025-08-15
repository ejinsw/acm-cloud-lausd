"use client";

import {
  Container,
  Title,
  Card,
  Text,
  Badge,
  Button,
  Grid,
  Group,
  Stack,
  Box,
  Loader,
  Center,
  ThemeIcon,
  RingProgress,
  Divider,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Session, SessionRequest } from "@/lib/types";
import PageWrapper from "@/components/PageWrapper";
import { SessionDetails } from "@/components/sessions/SessionDetails";
import { getToken } from "@/actions/authentication";
import {
  IconCalendar,
  IconArrowLeft,
  IconPlayerPlay,
  IconClockHour4,
  IconStar,
  IconUsersGroup,
  IconUser,
  IconCheck,
  IconX,
  IconAlertCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { routes } from "@/app/routes";
import { notifications } from "@mantine/notifications";
import { useAuth } from "@/components/AuthProvider";
import { LogOut } from "lucide-react";

function SessionDetailsContent() {
  const { user, refreshUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionRequestStatus, setSessionRequestStatus] = useState<
    "PENDING" | "ACCEPTED" | "REJECTED" | null
  >(null);

  // Function to update session request status based on current user data
  const updateSessionRequestStatus = () => {
    if (user?.sessionRequests && params.id) {
      const request = user.sessionRequests.find(
        (request: SessionRequest) => request.sessionId === params.id
      );
      setSessionRequestStatus(request?.status ?? null);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Session not found");
        }

        const data = await response.json();
        setSession(data.session);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load session");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchSession();
      updateSessionRequestStatus();
    }
  }, [params.id, user?.sessionRequests]); // Remove sessionRequestStatus from dependencies

  const handleRequestSession = async (sessionId: string) => {
    if (isRequesting) return; // Prevent multiple simultaneous requests
    
    try {
      setIsRequesting(true);
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/session-requests`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to request session");
      }

      const data = await response.json();
      console.log("Session request response:", data);
      
      // Update local state immediately for better UX
      setSessionRequestStatus(data.sessionRequest.status ?? "PENDING");
      
      notifications.show({
        title: "Session Request Sent",
        message:
          "Your session request has been sent to the instructor. You will be notified when the instructor accepts or rejects your request.",
        color: "green",
      });

      await refreshUser();
    } catch (err) {
      console.error("Error requesting session:", err);
      notifications.show({
        title: "Error",
        message: "Failed to send session request. Please try again.",
        color: "red",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancelRequest = async (sessionRequestId: string) => {
    if (!sessionRequestId) {
      notifications.show({
        title: "Error",
        message: "Session request ID not found. Please refresh the page and try again.",
        color: "red",
      });
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/session-requests/${sessionRequestId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel session request");
      }

      console.log("Session request cancelled");
      
      // Update local state immediately for better UX
      setSessionRequestStatus(null);
      
      notifications.show({
        title: "Session Request Cancelled",
        message: "Your session request has been cancelled.",
        color: "red",
      });

      await refreshUser();
    } catch (err) {
      console.error("Error cancelling session request:", err);
      notifications.show({
        title: "Error",
        message: "Failed to cancel session request. Please try again.",
        color: "red",
      });
    }
  };

  // Function to handle re-requesting a session after rejection
  const handleReRequestSession = async () => {
    if (isRequesting) return; // Prevent multiple simultaneous requests
    
    try {
      setIsRequesting(true);
      const token = await getToken();
      let response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/session-requests/${getCurrentSessionRequestId()}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete session");
      }

      response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/session-requests`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId: session?.id }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to re-request session");
      }

      const data = await response.json();
      console.log("Session re-request response:", data);
      
      // Update local state immediately for better UX
      setSessionRequestStatus(data.sessionRequest.status ?? "PENDING");
      
      notifications.show({
        title: "Session Re-requested",
        message: "Your session request has been sent again. The instructor will review your request.",
        color: "green",
      });

      await refreshUser();
    } catch (err) {
      console.error("Error re-requesting session:", err);
      notifications.show({
        title: "Error",
        message: "Failed to re-request session. Please try again.",
        color: "red",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  // Helper function to get the session request ID for the current session
  const getCurrentSessionRequestId = (): string | null => {
    if (user?.sessionRequests && params.id) {
      const request = user.sessionRequests.find(
        (request: SessionRequest) => request.sessionId === params.id
      );
      return request?.id ?? null;
    }
    return null;
  };

  const getDuration = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return "TBD";
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  };

  if (isLoading) {
    return (
      <Container size="lg" py="xl">
        <Center py="xl" style={{ minHeight: "60vh" }}>
          <Stack align="center" gap="xl">
            <RingProgress
              size={120}
              thickness={8}
              sections={[{ value: 100, color: "blue" }]}
              label={
                <Center>
                  <Loader size="lg" />
                </Center>
              }
            />
            <Stack align="center" gap="xs">
              <Text size="xl" fw={600}>
                Loading Session
              </Text>
              <Text size="md" c="dimmed">
                Getting all the details ready...
              </Text>
            </Stack>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (error || !session) {
    return (
      <Container size="lg" py="xl">
        <Center py="xl" style={{ minHeight: "60vh" }}>
          <Stack align="center" gap="xl">
            <ThemeIcon size={120} radius="xl" color="red" variant="light">
              <IconCalendar size={60} />
            </ThemeIcon>
            <Stack align="center" gap="md">
              <Title order={2} c="red">
                Session Not Found
              </Title>
              <Text size="lg" c="dimmed" ta="center">
                {error ||
                  "The session you're looking for doesn't exist or has been removed."}
              </Text>
              <Button
                size="lg"
                onClick={() => router.push(routes.exploreSessions)}
                leftSection={<IconArrowLeft size={20} />}
              >
                Back to Explore Sessions
              </Button>
            </Stack>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      {/* Back Button */}
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => router.push(routes.exploreSessions)}
        mb="lg"
      >
        Back to Sessions
      </Button>

      {/* Main Content */}
      <Grid gutter="xl">
        {/* Left Column - Session Details */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="lg">
            {/* Session Header */}
            <Box>
              <Title order={1} mb="md">
                {session.name}
              </Title>

              <Group gap="sm" mb="lg">
                {session.subjects?.map((subject) => (
                  <Badge key={subject.id} size="lg" color="blue">
                    {subject.name}
                  </Badge>
                ))}
                <Badge size="lg" color="green">
                  BEGINNER
                </Badge>
                {session.instructor?.averageRating && (
                  <Badge
                    size="lg"
                    color="green"
                    leftSection={<IconStar size={14} />}
                  >
                    {session.instructor.averageRating.toFixed(1)}/5
                  </Badge>
                )}
              </Group>
            </Box>

            {/* Session Details Component */}
            <SessionDetails session={session} showJoinButton={false} />
          </Stack>
        </Grid.Col>

        {/* Right Column - Booking Sidebar */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="lg">
            {/* Book This Session */}
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Title order={3} mb="lg">
                Book This Session
              </Title>

              <Stack gap="md">
                <Group gap="sm">
                  <ThemeIcon size="md" radius="xl" color="blue">
                    <IconClockHour4 size={16} />
                  </ThemeIcon>
                  <Text fw={500}>
                    {getDuration(session.startTime, session.endTime)}
                  </Text>
                </Group>

                <Group gap="sm">
                  <ThemeIcon size="md" radius="xl" color="green">
                    <IconCalendar size={16} />
                  </ThemeIcon>
                  <Text fw={500}>Available: Monday, Wednesday, Friday</Text>
                </Group>

                <Stack gap="sm" mt="md">
                  {/* NULL STATUS - No request made yet */}
                  {sessionRequestStatus === null && (
                    <Button
                      fullWidth
                      size="md"
                      leftSection={<IconPlayerPlay size={16} />}
                      onClick={() => handleRequestSession(session.id)}
                      loading={isRequesting}
                      disabled={isRequesting}
                    >
                      {isRequesting ? "Sending Request..." : "Request Session"}
                    </Button>
                  )}

                  {/* PENDING STATUS - Request sent, can cancel */}
                  {sessionRequestStatus === "PENDING" && (
                    <>
                      <Group gap="sm" justify="space-between" w="100%" wrap="nowrap">
                        <Button
                          fullWidth
                          size="md"
                          variant="outline"
                          leftSection={<IconClockHour4 size={16} />}
                          disabled
                        >
                          Request Pending
                        </Button>
                        {getCurrentSessionRequestId() && (
                          <Button
                            size="md"
                            color="red"
                            variant="outline"
                            onClick={() => handleCancelRequest(getCurrentSessionRequestId()!)}
                            title="Cancel Request"
                          >
                            <LogOut size={16} />
                          </Button>
                        )}
                      </Group>
                      
                      {/* Pending info */}
                      <Box
                        p="sm"
                        bg="yellow.0"
                        style={{ border: '1px solid var(--mantine-color-yellow-3)', borderRadius: 'var(--mantine-radius-sm)' }}
                      >
                        <Group gap="xs" align="center">
                          <IconAlertCircle size={16} color="var(--mantine-color-yellow-8)" />
                          <Text size="sm" c="yellow.8" fw={500}>
                            Waiting for instructor response
                          </Text>
                        </Group>
                        <Text size="xs" c="yellow.7" mt={4} ml={20}>
                          Your request has been sent. The instructor will review and respond soon. You can cancel anytime.
                        </Text>
                      </Box>
                    </>
                  )}

                  {/* ACCEPTED STATUS - Can join session or cancel */}
                  {sessionRequestStatus === "ACCEPTED" && (
                    <>
                      <Group gap="sm" justify="space-between" w="100%" wrap="nowrap">
                        <Button
                          fullWidth
                          size="md"
                          color="green"
                          leftSection={<IconPlayerPlay size={16} />}
                          component={Link}
                          href={session.zoomLink || "#"}
                          target="_blank"
                          disabled={!session.zoomLink}
                        >
                          {session.zoomLink ? "Join Session" : "Session Link TBD"}
                        </Button>
                        {getCurrentSessionRequestId() && (
                          <Button
                            size="md"
                            color="red"
                            variant="outline"
                            onClick={() => handleCancelRequest(getCurrentSessionRequestId()!)}
                            title="Cancel Session"
                          >
                            <LogOut size={16} />
                          </Button>
                        )}
                      </Group>
                      
                      {/* Session reminder for accepted sessions */}
                      {session.startTime && (
                        <Box
                          p="sm"
                          bg="green.0"
                          style={{ border: '1px solid var(--mantine-color-green-3)', borderRadius: 'var(--mantine-radius-sm)' }}
                        >
                          <Group gap="xs" align="center">
                            <IconCheck size={16} color="var(--mantine-color-green-8)" />
                            <Text size="sm" c="green.8" fw={500}>
                              Your session is confirmed!
                            </Text>
                          </Group>
                          <Text size="xs" c="green.7" mt={4} ml={20}>
                            Session starts at {new Date(session.startTime).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZoneName: "short",
                            })}
                          </Text>
                        </Box>
                      )}
                    </>
                  )}

                  {/* REJECTED STATUS - Show rejection message */}
                  {sessionRequestStatus === "REJECTED" && (
                    <>
                      <Group gap="sm" justify="space-between" w="100%" wrap="nowrap">
                        <Button
                          fullWidth
                          size="md"
                          color="red"
                          variant="outline"
                          leftSection={<IconX size={16} />}
                          disabled
                        >
                          Request Rejected
                        </Button>
                        <Button
                          size="md"
                          color="blue"
                          variant="outline"
                          onClick={handleReRequestSession}
                          title="Try Again"
                          loading={isRequesting}
                          disabled={isRequesting}
                        >
                          {isRequesting ? "Sending..." : "Try Again"}
                        </Button>
                      </Group>
                      
                      {/* Rejection info */}
                      <Box
                        p="sm"
                        bg="red.0"
                        style={{ border: '1px solid var(--mantine-color-red-3)', borderRadius: 'var(--mantine-radius-sm)' }}
                      >
                        <Group gap="xs" align="center">
                          <IconX size={16} color="var(--mantine-color-red-8)" />
                          <Text size="sm" c="red.8" fw={500}>
                            Your session request was not accepted
                          </Text>
                        </Group>
                        <Text size="xs" c="red.7" mt={4} ml={20}>
                          The instructor has declined your request. You can explore other sessions, contact the instructor for more information, or try requesting again.
                        </Text>
                      </Box>
                    </>
                  )}

                  <Button
                    variant="outline"
                    fullWidth
                    size="md"
                    leftSection={<IconUser size={16} />}
                    component={Link}
                    href={routes.instructorProfile(
                      session.instructor?.id || ""
                    )}
                  >
                    View Instructor Profile
                  </Button>
                </Stack>
              </Stack>
            </Card>

            {/* Session Timeline */}
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Title order={3} mb="lg">
                Session Timeline
              </Title>

              <Stack gap="md">
                <Group gap="sm">
                  <ThemeIcon size="md" radius="xl" color="blue">
                    <IconCalendar size={16} />
                  </ThemeIcon>
                  <Text fw={500}>Date & Time</Text>
                </Group>
                <Text size="sm" c="dimmed">
                  {session.startTime
                    ? new Date(session.startTime).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "TBD"}
                </Text>
                <Text size="sm" c="dimmed">
                  {session.startTime
                    ? new Date(session.startTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZoneName: "short",
                      })
                    : "TBD"}
                </Text>

                <Divider />

                <Group gap="sm">
                  <ThemeIcon size="md" radius="xl" color="green">
                    <IconClockHour4 size={16} />
                  </ThemeIcon>
                  <Text fw={500}>Duration</Text>
                </Group>
                <Text size="sm" c="dimmed">
                  {getDuration(session.startTime, session.endTime)}
                </Text>

                <Divider />

                <Group gap="sm">
                  <ThemeIcon size="md" radius="xl" color="orange">
                    <IconUsersGroup size={16} />
                  </ThemeIcon>
                  <Text fw={500}>Capacity</Text>
                </Group>
                <Text size="sm" c="dimmed">
                  {session.maxAttendees || "∞"} attendees
                </Text>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default function SessionDetailsPage() {
  return (
    <PageWrapper>
      <SessionDetailsContent />
    </PageWrapper>
  );
}
