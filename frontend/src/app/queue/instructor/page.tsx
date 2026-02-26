"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useAuth } from "../../../components/AuthProvider";
import { useRouter } from "next/navigation";
import {
  Box,
  Text,
  Card,
  Group,
  Stack,
  Button,
  Badge,
  Alert,
  Loader,
  Center,
  ActionIcon,
  Tooltip,
  SegmentedControl,
  Avatar,
  Kbd,
  Paper,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconWifi,
  IconWifiOff,
  IconRefresh,
  IconCheck,
  IconPlayerSkipForward,
  IconPin,
  IconClockHour4,
} from "@tabler/icons-react";
import { getToken } from "../../../actions/authentication";
import { useQueueWebSocket, QueueItem } from "../../../hooks/useQueueWebSocket";
import { notifications } from "@mantine/notifications";
import { CheckCircle2, Star, XCircle } from "lucide-react";

interface EnrichedQueueItem extends QueueItem {
  id: number;
  studentId: string;
  canTeach: boolean;
  createdAt: string;
}

const initials = (first?: string, last?: string) =>
  `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase() || "?";

const timeAgo = (value?: string) => {
  if (!value) return "just now";
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
};

const formatRating = (value?: number | null) => {
  if (value === undefined || value === null) return "No rating";
  return `${value.toFixed(1)}/5`;
};

export default function InstructorQueuePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"deck" | "list">("deck");
  const [activeIndex, setActiveIndex] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const {
    isConnected,
    connectionError,
    queueItems,
    queueDeckActions,
    reconnect,
    acceptQueue,
    markDeckAction,
    clearDeckAction,
  } = useQueueWebSocket(user);

  const enrichedItems = useMemo(() => {
    const items: EnrichedQueueItem[] = [];
    for (const [cognitoId, item] of queueItems.entries()) {
      const studentId = item.studentId || cognitoId;
      const canTeach = user?.subjects?.some((s: any) => s.id === item.subjectId) ?? false;
      items.push({
        ...item,
        id: item.id || 0,
        studentId,
        canTeach,
        createdAt: item.createdAt || new Date().toISOString(),
      });
    }
    return items.sort((a, b) => {
      const aAction = queueDeckActions.get(a.studentId);
      const bAction = queueDeckActions.get(b.studentId);
      if (aAction === "PIN" && bAction !== "PIN") return -1;
      if (aAction !== "PIN" && bAction === "PIN") return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [queueItems, queueDeckActions, user?.subjects]);

  const visibleDeck = useMemo(
    () =>
      enrichedItems.filter((item) => {
        const action = queueDeckActions.get(item.studentId);
        return action !== "PASS";
      }),
    [enrichedItems, queueDeckActions],
  );

  const currentCard = visibleDeck[activeIndex] || null;

  useEffect(() => {
    if (activeIndex >= visibleDeck.length) {
      setActiveIndex(Math.max(0, visibleDeck.length - 1));
    }
  }, [activeIndex, visibleDeck.length]);

  const handleAcceptStudent = async (queueItem: EnrichedQueueItem) => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/sessions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: `${queueItem.subject?.name} with ${queueItem.student?.firstName} ${queueItem.student?.lastName}`,
            description: queueItem.description,
            startTime: Date.now(),
            endTime: new Date(Date.now() + 30 * 60 * 1000),
            maxAttendees: 2,
            students: [queueItem.studentId],
            subjects: [queueItem.subjectId],
          }),
        },
      );

      if (!response.ok) {
        notifications.show({
          title: "Error",
          message: "Could not create a session. Please try again.",
          color: "red",
          icon: <XCircle size={16} />,
        });
        return;
      }

      const sessionData = await response.json();
      const sessionId = sessionData.session?.id || sessionData.id;
      if (!sessionId) {
        throw new Error("Session ID missing");
      }

      acceptQueue(queueItem.studentId, sessionId);
      clearDeckAction(queueItem.studentId);
      notifications.show({
        title: "Student accepted",
        message: `Starting session with ${queueItem.student?.firstName || "student"}`,
        color: "green",
        icon: <CheckCircle2 size={16} />,
      });
      router.push(`/sessions/${sessionId}`);
    } catch (error) {
      console.error("[TutorDeck] Accept failed:", error);
      notifications.show({
        title: "Error",
        message: "Failed to accept student. Please try again.",
        color: "red",
        icon: <XCircle size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePass = () => {
    if (!currentCard) return;
    markDeckAction(currentCard.studentId, "PASS");
    setActiveIndex((i) => Math.min(i + 1, visibleDeck.length));
  };

  const handlePin = () => {
    if (!currentCard) return;
    const isPinned = queueDeckActions.get(currentCard.studentId) === "PIN";
    if (isPinned) {
      clearDeckAction(currentCard.studentId);
    } else {
      markDeckAction(currentCard.studentId, "PIN");
    }
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!currentCard) return;
      if ((event.target as HTMLElement)?.tagName === "INPUT") return;
      if (event.key.toLowerCase() === "a") {
        void handleAcceptStudent(currentCard);
      }
      if (event.key.toLowerCase() === "s") {
        handlePass();
      }
      if (event.key.toLowerCase() === "p") {
        handlePin();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentCard, queueDeckActions, visibleDeck.length]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    setDrag({ x: 0, y: 0, active: true });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;
    setDrag({ x: dx, y: dy, active: true });
  };

  const onPointerUp = () => {
    if (!currentCard) {
      setDrag({ x: 0, y: 0, active: false });
      dragStartRef.current = null;
      return;
    }
    if (drag.x > 90) {
      void handleAcceptStudent(currentCard);
    } else if (drag.x < -90) {
      handlePass();
    } else if (drag.y < -90) {
      handlePin();
    }
    setDrag({ x: 0, y: 0, active: false });
    dragStartRef.current = null;
  };

  if (!user || user.role !== "INSTRUCTOR") {
    return (
      <Box p="xl">
        <Text>Access denied. This page is for instructors only.</Text>
      </Box>
    );
  }

  return (
    <Box p={{ base: "md", sm: "xl" }} className="app-page-grid">
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => router.back()}
        w="fit-content"
      >
        Back
      </Button>

      <Paper p="lg" className="app-glass">
        <Group justify="space-between" wrap="wrap" align="flex-start">
          <Stack gap={4}>
            <Text size="xl" fw={700}>
              TutorDeck Queue
            </Text>
            <Text c="dimmed" size="sm">
              Swipe right accept, left pass, up pin. Fairness remains wait-time first.
            </Text>
          </Stack>
          <Group gap="sm">
            <Badge size="lg" color="yellow" variant="light" leftSection={<Star size={12} />}>
              Your rating: {formatRating(user.averageRating)}
            </Badge>
            <Badge size="lg" color="blue" variant="light">
              {enrichedItems.length} waiting
            </Badge>
            {isConnected ? (
              <Tooltip label="Connected to live queue">
                <ActionIcon variant="light" color="green">
                  <IconWifi size={18} />
                </ActionIcon>
              </Tooltip>
            ) : (
              <Tooltip label="Reconnect">
                <ActionIcon variant="light" color="red" onClick={reconnect}>
                  <IconWifiOff size={18} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>
      </Paper>

      <Group justify="space-between" wrap="wrap">
        <SegmentedControl
          value={viewMode}
          onChange={(value) => setViewMode(value as "deck" | "list")}
          data={[
            { label: "TutorDeck", value: "deck" },
            { label: "Compact List", value: "list" },
          ]}
        />
        <Group gap="xs">
          <Text size="xs" c="dimmed">
            Keys:
          </Text>
          <Kbd>A</Kbd>
          <Kbd>S</Kbd>
          <Kbd>P</Kbd>
        </Group>
      </Group>

      {connectionError && (
        <Alert color="red" title="Queue Connection Error">
          <Group justify="space-between">
            <Text size="sm">{connectionError}</Text>
            <Button size="xs" variant="light" onClick={reconnect} leftSection={<IconRefresh size={14} />}>
              Retry
            </Button>
          </Group>
        </Alert>
      )}

      {!isConnected && queueItems.size === 0 ? (
        <Card className="app-glass" p="xl">
          <Center>
            <Stack align="center" gap="md">
              <Loader size="lg" />
              <Text c="dimmed">Connecting to queue...</Text>
            </Stack>
          </Center>
        </Card>
      ) : enrichedItems.length === 0 ? (
        <Card className="app-glass" p="xl">
          <Center>
            <Stack align="center" gap="sm">
              <Text fw={600}>No students in queue</Text>
              <Text size="sm" c="dimmed">
                Students will appear here in real time.
              </Text>
            </Stack>
          </Center>
        </Card>
      ) : viewMode === "deck" ? (
        <Center>
          <Card
            className="app-glass"
            p="xl"
            maw={560}
            miw={{ base: 320, sm: 480 }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{
              transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 18}deg)`,
              transition: drag.active ? "none" : "transform 180ms ease",
            }}
          >
            {currentCard ? (
              <Stack gap="md">
                <Group justify="space-between">
                  <Badge color="yellow" variant="light">
                    Position #{currentCard.queuePosition ?? activeIndex + 1}
                  </Badge>
                  <Group gap={4} c="dimmed">
                    <IconClockHour4 size={14} />
                    <Text size="xs">{timeAgo(currentCard.createdAt)}</Text>
                  </Group>
                </Group>
                <Group>
                  <Avatar color="blue" radius="xl" size={52}>
                    {initials(currentCard.student?.firstName, currentCard.student?.lastName)}
                  </Avatar>
                  <Stack gap={0}>
                    <Text fw={700}>
                      {currentCard.student?.firstName || "Student"} {currentCard.student?.lastName || ""}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {currentCard.subject?.name || "Unknown Subject"}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Student rating: {formatRating(currentCard.student?.averageRating)}
                    </Text>
                  </Stack>
                </Group>
                <Text size="sm">{currentCard.description || "No description provided."}</Text>
                <Group gap="xs">
                  <Badge color={currentCard.canTeach ? "green" : "orange"} variant="light">
                    {currentCard.canTeach ? "Subject match" : "Outside expertise"}
                  </Badge>
                  <Badge color="blue" variant="outline">
                    Est wait {currentCard.estimatedWaitMinutes ?? 15}m
                  </Badge>
                </Group>
                <Group grow mt="sm">
                  <Button
                    variant="light"
                    color="gray"
                    leftSection={<IconPlayerSkipForward size={15} />}
                    onClick={handlePass}
                  >
                    Pass
                  </Button>
                  <Button
                    variant={queueDeckActions.get(currentCard.studentId) === "PIN" ? "filled" : "light"}
                    color="yellow"
                    leftSection={<IconPin size={15} />}
                    onClick={handlePin}
                  >
                    {queueDeckActions.get(currentCard.studentId) === "PIN" ? "Pinned" : "Pin"}
                  </Button>
                  <Button
                    color="green"
                    leftSection={<IconCheck size={15} />}
                    onClick={() => void handleAcceptStudent(currentCard)}
                    loading={isLoading}
                  >
                    Accept
                  </Button>
                </Group>
              </Stack>
            ) : (
              <Center>
                <Stack align="center" py="xl">
                  <Text fw={600}>Deck complete</Text>
                  <Text size="sm" c="dimmed">
                    You passed all current requests. Switch to compact list to revisit.
                  </Text>
                </Stack>
              </Center>
            )}
          </Card>
        </Center>
      ) : (
        <Stack gap="md">
          {enrichedItems.map((item, index) => {
            const deckAction = queueDeckActions.get(item.studentId);
            return (
              <Card key={`${item.studentId}-${item.id}`} className="app-glass" p="md">
                <Group justify="space-between" align="flex-start">
                  <Group align="flex-start" style={{ flex: 1 }}>
                    <Avatar color="blue" radius="xl">
                      {initials(item.student?.firstName, item.student?.lastName)}
                    </Avatar>
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Group gap="xs">
                        <Text fw={600}>
                          {item.student?.firstName} {item.student?.lastName}
                        </Text>
                        <Badge size="xs" color="yellow" variant="light">
                          #{item.queuePosition ?? index + 1}
                        </Badge>
                        {deckAction && (
                          <Badge size="xs" color={deckAction === "PIN" ? "yellow" : "gray"} variant="light">
                            {deckAction}
                          </Badge>
                        )}
                      </Group>
                      <Text size="sm" c="dimmed">
                        {item.subject?.name || "Unknown Subject"} • {timeAgo(item.createdAt)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Student rating: {formatRating(item.student?.averageRating)}
                      </Text>
                      <Text size="sm">{item.description}</Text>
                    </Stack>
                  </Group>
                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="yellow"
                      onClick={() =>
                        deckAction === "PIN"
                          ? clearDeckAction(item.studentId)
                          : markDeckAction(item.studentId, "PIN")
                      }
                    >
                      <IconPin size={16} />
                    </ActionIcon>
                    <Button size="xs" variant="light" color="gray" onClick={() => markDeckAction(item.studentId, "PASS")}>
                      Pass
                    </Button>
                    <Button size="xs" color="green" onClick={() => void handleAcceptStudent(item)} loading={isLoading}>
                      Accept
                    </Button>
                  </Group>
                </Group>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
