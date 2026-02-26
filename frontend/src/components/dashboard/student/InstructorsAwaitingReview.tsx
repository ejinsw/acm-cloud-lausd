"use client";

import { Box, Text, Group, Button, Stack, Divider, Badge } from "@mantine/core";
import { Calendar, Star, User } from "lucide-react";
import { Review, Session } from "@/lib/types";

interface InstructorsAwaitingReviewProps {
  completedSessions: Session[];
  ownerReviews: Review[];
  onReviewClick: (sessionId: string) => void;
}

interface PendingInstructor {
  key: string;
  name: string;
  latestSession: Session;
  sessionCount: number;
}

function formatSessionDate(dateString?: string) {
  if (!dateString) return "Date unavailable";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function InstructorsAwaitingReview({
  completedSessions,
  ownerReviews,
  onReviewClick,
}: InstructorsAwaitingReviewProps) {
  const reviewedRecipientIds = new Set(
    ownerReviews
      .map((review) => review.recipientId)
      .filter((value): value is string => Boolean(value)),
  );

  const pendingMap = new Map<string, PendingInstructor>();

  const sortedSessions = [...completedSessions].sort((a, b) => {
    const aTime = a.startTime || a.endTime || a.createdAt || "";
    const bTime = b.startTime || b.endTime || b.createdAt || "";
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  for (const session of sortedSessions) {
    const instructorId = session.instructor?.id || session.instructorId || "";
    const instructorName = session.instructor
      ? `${session.instructor.firstName} ${session.instructor.lastName}`
      : "Instructor";
    const key = instructorId || `name:${instructorName}`;

    if (!instructorId) {
      continue;
    }

    if (instructorId && reviewedRecipientIds.has(instructorId)) {
      continue;
    }

    const existing = pendingMap.get(key);
    if (existing) {
      existing.sessionCount += 1;
      continue;
    }

    pendingMap.set(key, {
      key,
      name: instructorName,
      latestSession: session,
      sessionCount: 1,
    });
  }

  const pendingInstructors = Array.from(pendingMap.values()).slice(0, 4);

  if (pendingInstructors.length === 0) {
    return null;
  }

  return (
    <Box pt="lg" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
      <Text fw={500} mb="md">
        Instructors awaiting your review
      </Text>
      <Stack gap={0}>
        {pendingInstructors.map((item, index) => (
          <Box key={item.key}>
            {index > 0 && <Divider />}
            <Box py="md">
              <Group justify="space-between" wrap="wrap" align="flex-start">
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Group gap="xs" mb={6}>
                    <User size={14} />
                    <Text fw={500} size="sm">
                      {item.name}
                    </Text>
                    <Badge size="xs" color="blue" variant="light">
                      {item.sessionCount} session{item.sessionCount > 1 ? "s" : ""}
                    </Badge>
                  </Group>
                  <Group gap="xs">
                    <Calendar size={12} />
                    <Text size="xs" c="dimmed">
                      Last session: {formatSessionDate(item.latestSession.startTime || item.latestSession.createdAt)}
                    </Text>
                  </Group>
                </Box>
                <Button
                  variant="light"
                  size="xs"
                  leftSection={<Star size={14} />}
                  onClick={() => onReviewClick(item.latestSession.id)}
                >
                  Review instructor
                </Button>
              </Group>
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
