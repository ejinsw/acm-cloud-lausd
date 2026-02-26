import { Group, Text, Badge, Button, Rating, Stack, Box, Divider, ThemeIcon } from "@mantine/core";
import { Calendar, Star, Clock, User, CheckCircle2 } from "lucide-react";
import { SessionHistoryItem } from "@/lib/types";

export interface PastSession extends SessionHistoryItem {
  userRating?: number | null;
  userReview?: string | null;
}

interface SessionHistoryTabProps {
  sessionHistory: SessionHistoryItem[];
  onReviewClick: (session: PastSession) => void;
}

// Format date for display
function formatSessionDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Calculate session duration
function getSessionDuration(startTime: string, endTime: string): number {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.round((end - start) / (1000 * 60)); // Duration in minutes
}

export function SessionHistoryTab({ sessionHistory, onReviewClick }: SessionHistoryTabProps) {
  if (sessionHistory.length === 0) {
    return (
      <Box py="xl" ta="center">
        <Text size="lg" fw={500} mb="xs">No session history yet</Text>
        <Text size="sm" c="dimmed">Your session history will appear here</Text>
      </Box>
    );
  }

  const grouped = sessionHistory.reduce<Record<string, SessionHistoryItem[]>>((acc, session) => {
    const key = (session.startTime || session.endTime || session.createdAt || "").slice(0, 10) || "Unknown";
    acc[key] = [...(acc[key] || []), session];
    return acc;
  }, {});

  const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <Stack gap="lg">
      {sortedKeys.map((dateKey) => (
        <Box key={dateKey}>
          <Text size="sm" fw={700} c="dimmed" mb="xs">
            {dateKey === "Unknown"
              ? "Unknown date"
              : new Date(dateKey).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
          </Text>
          <Stack gap={0}>
            {grouped[dateKey].map((session, index) => {
              const duration =
                session.startTime && session.endTime
                  ? getSessionDuration(session.startTime, session.endTime)
                  : 0;

              return (
                <Box key={session.id}>
                  {index > 0 && <Divider />}
                  <Group align="flex-start" gap="md" py="lg" wrap="nowrap">
                    <ThemeIcon
                      radius="xl"
                      size="md"
                      color={session.relatedReview ? "green" : "yellow"}
                      variant="light"
                      mt={2}
                    >
                      {session.relatedReview ? <CheckCircle2 size={14} /> : <Star size={14} />}
                    </ThemeIcon>
                    <Box style={{ flex: 1 }}>
                      <Group justify="space-between" mb="sm" wrap="wrap">
                        <Text fw={600}>{session.name}</Text>
                        <Group gap="xs">
                          <Badge color="blue" variant="light" size="sm">
                            Completed
                          </Badge>
                          <Badge
                            color={session.relatedReview ? "green" : "yellow"}
                            variant="outline"
                            size="sm"
                          >
                            {session.relatedReview ? "Reviewed" : "Review pending"}
                          </Badge>
                        </Group>
                      </Group>

                      <Stack gap={4} mb="md">
                        {session.instructorName && (
                          <Group gap="xs">
                            <User size={14} />
                            <Text size="sm">{session.instructorName}</Text>
                          </Group>
                        )}
                        {session.startTime && (
                          <Group gap="xs">
                            <Calendar size={14} />
                            <Text size="sm">{formatSessionDate(session.startTime)}</Text>
                          </Group>
                        )}
                        {duration > 0 && (
                          <Group gap="xs">
                            <Clock size={14} />
                            <Text size="sm">{duration} minutes</Text>
                          </Group>
                        )}
                        {session.description && (
                          <Text size="sm" c="dimmed" lineClamp={2}>
                            {session.description}
                          </Text>
                        )}
                      </Stack>

                      {session.relatedReview ? (
                        <Stack gap="xs">
                          <Group gap="xs">
                            <Rating value={session.relatedReview.rating} readOnly size="sm" />
                            <Text size="sm" fw={500}>
                              {session.relatedReview.rating}/5
                            </Text>
                          </Group>
                          {session.relatedReview.comment && (
                            <Text size="xs" c="dimmed" lineClamp={2} fs="italic">
                              &ldquo;{session.relatedReview.comment}&rdquo;
                            </Text>
                          )}
                        </Stack>
                      ) : (
                        <Button
                          variant="light"
                          size="xs"
                          onClick={() => onReviewClick(session as PastSession)}
                          leftSection={<Star size={14} />}
                        >
                          Review now
                        </Button>
                      )}
                    </Box>
                  </Group>
                </Box>
              );
            })}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
