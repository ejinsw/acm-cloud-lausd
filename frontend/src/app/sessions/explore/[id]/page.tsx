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
import { Session } from "@/lib/types";
import PageWrapper from "@/components/PageWrapper";
import { SessionDetails } from "@/components/sessions/SessionDetails";
import { getToken } from "@/actions/authentication";
import {
  IconCalendar,
  IconArrowLeft,
  IconPlayerPlay,
  IconClockHour4,
  IconMessageCircle,
  IconStar,
  IconUsersGroup,
} from "@tabler/icons-react";
import Link from "next/link";
import { routes } from "@/app/routes";

function SessionDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    }
  }, [params.id]);



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
        <Center py="xl" style={{ minHeight: '60vh' }}>
          <Stack align="center" gap="xl">
            <RingProgress
              size={120}
              thickness={8}
              sections={[{ value: 100, color: 'blue' }]}
              label={
                <Center>
                  <Loader size="lg" />
                </Center>
              }
            />
            <Stack align="center" gap="xs">
              <Text size="xl" fw={600}>Loading Session</Text>
              <Text size="md" c="dimmed">Getting all the details ready...</Text>
            </Stack>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (error || !session) {
    return (
      <Container size="lg" py="xl">
        <Center py="xl" style={{ minHeight: '60vh' }}>
          <Stack align="center" gap="xl">
            <ThemeIcon size={120} radius="xl" color="red" variant="light">
              <IconCalendar size={60} />
            </ThemeIcon>
            <Stack align="center" gap="md">
              <Title order={2} c="red">Session Not Found</Title>
              <Text size="lg" c="dimmed" ta="center">
                {error || "The session you're looking for doesn't exist or has been removed."}
              </Text>
              <Button 
                size="lg" 
                onClick={() => router.push("/sessions/explore")}
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
        onClick={() => router.push("/sessions/explore")}
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
              <Title order={1} mb="md">{session.name}</Title>
              
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
                  <Badge size="lg" color="green" leftSection={<IconStar size={14} />}>
                    {session.instructor.averageRating.toFixed(1)}/5
                  </Badge>
                )}
              </Group>
            </Box>

            {/* Session Details Component */}
            <SessionDetails 
              session={session} 
              showJoinButton={false}
            />
          </Stack>
        </Grid.Col>

        {/* Right Column - Booking Sidebar */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="lg">
            {/* Book This Session */}
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Title order={3} mb="lg">Book This Session</Title>
              
              <Stack gap="md">
                <Group gap="sm">
                  <ThemeIcon size="md" radius="xl" color="blue">
                    <IconClockHour4 size={16} />
                  </ThemeIcon>
                  <Text fw={500}>{getDuration(session.startTime, session.endTime)}</Text>
                </Group>
                
                <Group gap="sm">
                  <ThemeIcon size="md" radius="xl" color="green">
                    <IconCalendar size={16} />
                  </ThemeIcon>
                  <Text fw={500}>Available: Monday, Wednesday, Friday</Text>
                </Group>
                
                <Stack gap="sm" mt="md">
                  <Button 
                    fullWidth 
                    size="md"
                    leftSection={<IconPlayerPlay size={16} />}
                    component={Link}
                    href={routes.session(session.id)}
                  >
                    Schedule Session
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    fullWidth 
                    size="md"
                    leftSection={<IconMessageCircle size={16} />}
                  >
                    Contact Instructor
                  </Button>
                </Stack>
              </Stack>
            </Card>

            {/* Session Timeline */}
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Title order={3} mb="lg">Session Timeline</Title>
              
              <Stack gap="md">
                <Group gap="sm">
                  <ThemeIcon size="md" radius="xl" color="blue">
                    <IconCalendar size={16} />
                  </ThemeIcon>
                  <Text fw={500}>Date & Time</Text>
                </Group>
                <Text size="sm" c="dimmed">
                  {session.startTime ? new Date(session.startTime).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) : "TBD"}
                </Text>
                <Text size="sm" c="dimmed">
                  {session.startTime ? new Date(session.startTime).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZoneName: "short",
                  }) : "TBD"}
                </Text>
                
                <Divider />
                
                <Group gap="sm">
                  <ThemeIcon size="md" radius="xl" color="green">
                    <IconClockHour4 size={16} />
                  </ThemeIcon>
                  <Text fw={500}>Duration</Text>
                </Group>
                <Text size="sm" c="dimmed">{getDuration(session.startTime, session.endTime)}</Text>
                
                <Divider />
                
                <Group gap="sm">
                  <ThemeIcon size="md" radius="xl" color="orange">
                    <IconUsersGroup size={16} />
                  </ThemeIcon>
                  <Text fw={500}>Capacity</Text>
                </Group>
                <Text size="sm" c="dimmed">{session.maxAttendees || "∞"} attendees</Text>
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
