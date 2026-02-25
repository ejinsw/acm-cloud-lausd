"use client";

import { Box, Text, Group, Button, Stack, Divider } from "@mantine/core";
import { Calendar, User, Star, Clock } from "lucide-react";
import { PastSession } from "./SessionHistoryTab";

interface UnreviewedSessionsProps {
  sessionHistory: PastSession[];
  onReviewClick?: (session: PastSession) => void;
  /** When true, shows "Leave review" button. When false (instructor), shows "Awaiting feedback" text. */
  canReview?: boolean;
}

function formatSessionDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSessionDuration(startTime: string, endTime: string): number {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.round((end - start) / (1000 * 60));
}

export function UnreviewedSessions({
  sessionHistory,
  onReviewClick,
  canReview = true,
}: UnreviewedSessionsProps) {
  const unreviewed = sessionHistory
    .filter((s) => !s.relatedReview)
    .sort((a, b) => {
      const aTime = a.startTime || a.endTime || a.createdAt || "";
      const bTime = b.startTime || b.endTime || b.createdAt || "";
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    })
    .slice(0, 3);

  if (unreviewed.length === 0) {
    return null;
  }

  const title = canReview ? "Sessions awaiting your review" : "Sessions awaiting student feedback";
  return (
    <Box pt="lg" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
      <Text fw={500} mb="md">
        {title}
      </Text>
      <Stack gap={0}>
        {unreviewed.map((session, index) => {
          const duration =
            session.startTime && session.endTime
              ? getSessionDuration(session.startTime, session.endTime)
              : 0;
          return (
            <Box key={session.id}>
              {index > 0 && <Divider />}
              <Box py="md">
                <Group justify="space-between" wrap="wrap" align="flex-start">
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text fw={500} size="sm" mb={4}>
                      {session.name}
                    </Text>
                    <Stack gap={4}>
                      {session.instructorName && (
                        <Group gap="xs">
                          <User size={12} />
                          <Text size="xs" c="dimmed">
                            {session.instructorName}
                          </Text>
                        </Group>
                      )}
                      {session.startTime && (
                        <Group gap="xs">
                          <Calendar size={12} />
                          <Text size="xs" c="dimmed">
                            {formatSessionDate(session.startTime)}
                          </Text>
                        </Group>
                      )}
                      {duration > 0 && (
                        <Group gap="xs">
                          <Clock size={12} />
                          <Text size="xs" c="dimmed">
                            {duration} min
                          </Text>
                        </Group>
                      )}
                    </Stack>
                  </Box>
                  {canReview && onReviewClick ? (
                    <Button
                      variant="light"
                      size="xs"
                      leftSection={<Star size={14} />}
                      onClick={() => onReviewClick(session)}
                    >
                      Leave review
                    </Button>
                  ) : (
                    <Text size="xs" c="dimmed">
                      Awaiting feedback
                    </Text>
                  )}
                </Group>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
