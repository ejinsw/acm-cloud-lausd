"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Container,
  Paper,
  Title,
  Text,
  Textarea,
  Button,
  Rating,
  Stack,
  Group,
  Card,
  Loader,
  Alert,
  Breadcrumbs,
  Anchor,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useAuth } from "@/components/AuthProvider";
import { getToken } from "@/actions/authentication";
import { AlertCircle, Calendar, User, Star } from "lucide-react";

interface SessionHistoryItem {
  id: string;
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  instructorName?: string;
  studentNames: string[];
}

interface CreateReviewFormData {
  rating: number;
  comment: string;
  sessionHistoryItemId: string;
}

export default function CreateReviewPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const sessionHistoryItemId = params.id as string;

  const [sessionData, setSessionData] = useState<SessionHistoryItem | null>(null);
  const [formData, setFormData] = useState<CreateReviewFormData>({
    rating: 0,
    comment: "",
    sessionHistoryItemId: sessionHistoryItemId,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch session history item details
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionHistoryItemId || !isAuthenticated) return;

      try {
        const token = await getToken();
        if (!token) {
          setError("Authentication required");
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/session-history/${sessionHistoryItemId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch session data");
        }

        const data = await response.json();
        setSessionData(data.sessionHistoryItem);

      } catch (err) {
        console.error("Error fetching session data:", err);
        setError("Failed to load session data");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionHistoryItemId, isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rating || !formData.comment.trim()) {
      showNotification({
        title: "Validation Error",
        message: "Please fill in all required fields",
        color: "red",
      });
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: formData.rating,
          comment: formData.comment,
          sessionHistoryItemId: formData.sessionHistoryItemId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create review");
      }

      showNotification({
        title: "Success!",
        message: "Your review has been submitted successfully",
        color: "green",
      });

      // Navigate back to dashboard or session history
      router.push(`/dashboard/${user?.role}`);

    } catch (err) {
      console.error("Error creating review:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to create review";
      setError(errorMessage);
      showNotification({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<AlertCircle size="1rem" />} title="Authentication Required" color="red">
          You must be logged in to create a review.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container size="md" py="xl">
        <div style={{ textAlign: 'center' }}>
          <Loader size="lg" />
          <Text mt="md">Loading session data...</Text>
        </div>
      </Container>
    );
  }

  if (error && !sessionData) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<AlertCircle size="1rem" />} title="Error" color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Breadcrumbs mb="lg">
        <Anchor onClick={() => router.push("/dashboard")}>Dashboard</Anchor>
        <Text>Create Review</Text>
      </Breadcrumbs>

      <Paper shadow="sm" p="xl" radius="md">
        <Stack gap="lg">
          <div>
            <Title order={2} mb="md">
              Leave a Review
            </Title>
            <Text size="sm" c="dimmed">
              Share your experience to help others and provide valuable feedback
            </Text>
          </div>

          {sessionData && (
            <Card withBorder p="md" bg="gray.0">
              <Stack gap="xs">
                <Text fw={500} size="lg">{sessionData.name}</Text>
                
                {sessionData.description && (
                  <Text size="sm" c="dimmed">{sessionData.description}</Text>
                )}
                
                <Group gap="md">
                  {sessionData.instructorName && (
                    <Group gap="xs">
                      <User size={16} />
                      <Text size="sm">Instructor: {sessionData.instructorName}</Text>
                    </Group>
                  )}
                  
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
            <Alert icon={<AlertCircle size="1rem" />} title="Error" color="red">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="md">

              <div>
                <Text size="sm" fw={500} mb="xs">
                  Overall Rating *
                </Text>
                <Group gap="xs" align="center">
                  <Rating
                    value={formData.rating}
                    onChange={(value) => setFormData(prev => ({ ...prev, rating: value }))}
                    size="lg"
                  />
                  <Text size="sm" c="dimmed">
                    {formData.rating > 0 && `${formData.rating}/5 stars`}
                  </Text>
                </Group>
              </div>

              <Textarea
                label="Your Review"
                placeholder="Share your experience... What did you learn? How was the teaching? Any suggestions for improvement?"
                required
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                minRows={4}
                maxRows={8}
              />

              <Group justify="space-between" mt="lg">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  loading={submitting}
                  leftSection={<Star size="1rem" />}
                  disabled={!formData.rating || !formData.comment.trim()}
                >
                  Submit Review
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
}
