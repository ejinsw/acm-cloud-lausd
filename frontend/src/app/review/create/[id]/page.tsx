"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  Alert,
  Anchor,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Group,
  Loader,
  Paper,
  Rating,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { AlertCircle, Calendar, Star, User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getToken } from "@/actions/authentication";
import { Session, SessionHistoryItem } from "@/lib/types";

interface ReviewDraft {
  rating: number;
  comment: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function CreateReviewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const sessionId = useMemo(() => {
    const fromQuery = searchParams?.get("sessionId");
    return fromQuery || (params.id as string);
  }, [params.id, searchParams]);

  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [sessionHistoryItemId, setSessionHistoryItemId] = useState<string | null>(null);
  const [submittedRecipientIds, setSubmittedRecipientIds] = useState<Set<string>>(new Set());

  const [studentDraft, setStudentDraft] = useState<ReviewDraft>({ rating: 0, comment: "" });
  const [instructorDrafts, setInstructorDrafts] = useState<Record<string, ReviewDraft>>({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingRecipientId, setSubmittingRecipientId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatSessionDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const upsertInstructorDraft = (studentId: string, patch: Partial<ReviewDraft>) => {
    setInstructorDrafts((prev) => ({
      ...prev,
      [studentId]: {
        rating: prev[studentId]?.rating ?? 0,
        comment: prev[studentId]?.comment ?? "",
        ...patch,
      },
    }));
  };

  useEffect(() => {
    const loadReviewContext = async () => {
      if (!isAuthenticated || !user?.id || !sessionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const token = await getToken();
        if (!token) {
          throw new Error("Authentication required");
        }

        const sessionResponse = await fetch(`${API_BASE}/api/sessions/${encodeURIComponent(sessionId)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!sessionResponse.ok) {
          throw new Error("Failed to fetch session details");
        }

        const sessionPayload = await sessionResponse.json();
        const fetchedSession = sessionPayload.session as Session;
        setSessionData(fetchedSession);

        const historyResponse = await fetch(`${API_BASE}/api/session-history`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        let matchedHistoryItemId: string | null = null;

        if (historyResponse.ok) {
          const historyPayload = await historyResponse.json();
          const sessionHistory = (historyPayload.sessions || []) as SessionHistoryItem[];

          const matched = sessionHistory.find((item) => {
            if (item.userId !== user.id) {
              return false;
            }
            return (
              item.name === fetchedSession.name &&
              item.instructorId === fetchedSession.instructorId &&
              item.startTime === fetchedSession.startTime &&
              item.endTime === fetchedSession.endTime
            );
          });

          if (matched?.id) {
            matchedHistoryItemId = matched.id;
          }
        }

        if (!matchedHistoryItemId) {
          const createHistoryResponse = await fetch(`${API_BASE}/api/session-history`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId }),
          });

          if (createHistoryResponse.ok) {
            const createHistoryPayload = await createHistoryResponse.json();
            matchedHistoryItemId = createHistoryPayload?.sessionHistoryItem?.id || null;
          }
        }

        setSessionHistoryItemId(matchedHistoryItemId);

        const reviewResponse = await fetch(
          `${API_BASE}/api/reviews?ownerId=${encodeURIComponent(user.id)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (reviewResponse.ok) {
          const reviewPayload = await reviewResponse.json();
          const ownedReviews = reviewPayload.reviews || [];
          const submittedIds = new Set<string>();

          ownedReviews.forEach((review: { recipientId?: string; sessionHistoryItemId?: string }) => {
            if (review.recipientId) {
              submittedIds.add(review.recipientId);
            }
            if (review.sessionHistoryItemId && matchedHistoryItemId && review.sessionHistoryItemId === matchedHistoryItemId && fetchedSession.instructorId) {
              submittedIds.add(fetchedSession.instructorId);
            }
          });

          setSubmittedRecipientIds(submittedIds);
        }
      } catch (err) {
        console.error("Error loading review context:", err);
        setError(err instanceof Error ? err.message : "Failed to load review page");
      } finally {
        setLoading(false);
      }
    };

    void loadReviewContext();
  }, [isAuthenticated, sessionId, user?.id]);

  const handleStudentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!sessionData?.instructorId) {
      setError("Missing instructor information for this session");
      return;
    }

    if (!studentDraft.rating || !studentDraft.comment.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Please provide a rating and comment",
        color: "red",
      });
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: studentDraft.rating,
          comment: studentDraft.comment,
          recipientId: sessionData.instructorId,
          sessionHistoryItemId,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload?.message || "Failed to submit review");
      }

      notifications.show({
        title: "Review Submitted",
        message: "Thanks for reviewing your instructor",
        color: "green",
      });

      setSubmittedRecipientIds((prev) => {
        const next = new Set(prev);
        next.add(sessionData.instructorId!);
        return next;
      });

      router.push(`/dashboard/${user?.role?.toLowerCase() || "student"}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit review";
      setError(message);
      notifications.show({
        title: "Error",
        message,
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInstructorSubmit = async (recipientId: string) => {
    const draft = instructorDrafts[recipientId] || { rating: 0, comment: "" };

    if (!draft.rating || !draft.comment.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Please provide a rating and comment for this student",
        color: "red",
      });
      return;
    }

    try {
      setSubmittingRecipientId(recipientId);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: draft.rating,
          comment: draft.comment,
          recipientId,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        if (response.status === 403) {
          throw new Error(
            errorPayload?.message ||
              "The API currently allows review creation for students only."
          );
        }
        throw new Error(errorPayload?.message || "Failed to submit review");
      }

      notifications.show({
        title: "Review Submitted",
        message: "Student review submitted successfully",
        color: "green",
      });

      setSubmittedRecipientIds((prev) => {
        const next = new Set(prev);
        next.add(recipientId);
        return next;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit review";
      setError(message);
      notifications.show({
        title: "Error",
        message,
        color: "red",
      });
    } finally {
      setSubmittingRecipientId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<AlertCircle size={16} />} title="Authentication Required" color="red">
          You must be logged in to leave reviews.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Loading review details...</Text>
        </Stack>
      </Container>
    );
  }

  if (error && !sessionData) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<AlertCircle size={16} />} title="Error" color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  const isStudent = user?.role === "STUDENT";
  const isInstructor = user?.role === "INSTRUCTOR";
  const instructorName = sessionData?.instructor
    ? `${sessionData.instructor.firstName} ${sessionData.instructor.lastName}`
    : "Instructor";

  return (
    <Container size="md" py="xl">
      <Breadcrumbs mb="lg">
        <Anchor onClick={() => router.push(`/dashboard/${user?.role?.toLowerCase() || "student"}`)}>
          Dashboard
        </Anchor>
        <Text>Session Review</Text>
      </Breadcrumbs>

      <Paper shadow="sm" p="xl" radius="md">
        <Stack gap="lg">
          <div>
            <Title order={2} mb="xs">
              Session Review
            </Title>
            <Text size="sm" c="dimmed">
              Leave feedback for this completed session.
            </Text>
          </div>

          {sessionData && (
            <Card withBorder p="md" bg="gray.0">
              <Stack gap="xs">
                <Text fw={600}>{sessionData.name}</Text>
                {sessionData.description && (
                  <Text size="sm" c="dimmed">
                    {sessionData.description}
                  </Text>
                )}
                <Group gap="md">
                  <Group gap="xs">
                    <User size={16} />
                    <Text size="sm">Instructor: {instructorName}</Text>
                  </Group>
                  {sessionData.startTime && (
                    <Group gap="xs">
                      <Calendar size={16} />
                      <Text size="sm">{formatSessionDate(sessionData.startTime)}</Text>
                    </Group>
                  )}
                </Group>
              </Stack>
            </Card>
          )}

          {error && (
            <Alert icon={<AlertCircle size={16} />} title="Error" color="red">
              {error}
            </Alert>
          )}

          {isStudent && sessionData?.instructorId && (
            <form onSubmit={handleStudentSubmit}>
              <Stack gap="md">
                <Text fw={500}>Rate your instructor</Text>
                <Group>
                  <Rating
                    value={studentDraft.rating}
                    onChange={(value) => setStudentDraft((prev) => ({ ...prev, rating: value }))}
                    size="lg"
                  />
                  <Text size="sm" c="dimmed">
                    {studentDraft.rating > 0 ? `${studentDraft.rating}/5` : "Select rating"}
                  </Text>
                </Group>

                <Textarea
                  label="Comment"
                  placeholder="What went well? What could improve?"
                  minRows={4}
                  required
                  value={studentDraft.comment}
                  onChange={(event) =>
                    setStudentDraft((prev) => ({ ...prev, comment: event.currentTarget.value }))
                  }
                />

                <Group justify="flex-end">
                  <Button
                    type="submit"
                    loading={submitting}
                    leftSection={<Star size={16} />}
                    disabled={submittedRecipientIds.has(sessionData.instructorId)}
                  >
                    {submittedRecipientIds.has(sessionData.instructorId) ? "Review Submitted" : "Submit Review"}
                  </Button>
                </Group>
              </Stack>
            </form>
          )}

          {isInstructor && (
            <Stack gap="md">
              <Text fw={500}>Review each student</Text>
              {!sessionData?.students || sessionData.students.length === 0 ? (
                <Text size="sm" c="dimmed">
                  No students to review for this session.
                </Text>
              ) : (
                sessionData.students.map((student) => {
                  const draft = instructorDrafts[student.id] || { rating: 0, comment: "" };
                  const submitted = submittedRecipientIds.has(student.id);

                  return (
                    <Card key={student.id} withBorder p="md">
                      <Stack gap="sm">
                        <Text fw={600}>{`${student.firstName} ${student.lastName}`}</Text>
                        <Group>
                          <Rating
                            value={draft.rating}
                            onChange={(value) => upsertInstructorDraft(student.id, { rating: value })}
                          />
                          <Text size="sm" c="dimmed">
                            {draft.rating > 0 ? `${draft.rating}/5` : "Select rating"}
                          </Text>
                        </Group>
                        <Textarea
                          label="Comment"
                          placeholder="Share feedback for this student"
                          minRows={3}
                          value={draft.comment}
                          onChange={(event) =>
                            upsertInstructorDraft(student.id, { comment: event.currentTarget.value })
                          }
                        />
                        <Group justify="flex-end">
                          <Button
                            onClick={() => handleInstructorSubmit(student.id)}
                            loading={submittingRecipientId === student.id}
                            disabled={submitted || submittingRecipientId === student.id}
                          >
                            {submitted ? "Review Submitted" : "Submit Student Review"}
                          </Button>
                        </Group>
                      </Stack>
                    </Card>
                  );
                })
              )}
            </Stack>
          )}

          {!isStudent && !isInstructor && (
            <Alert icon={<AlertCircle size={16} />} title="Unsupported Role" color="yellow">
              Reviews are currently available for students and instructors only.
            </Alert>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
