"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Loader,
  Alert,
  Box,
  Center,
} from "@mantine/core";
import { AlertCircle } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { SessionHistoryTab } from "@/components/dashboard/student/SessionHistoryTab";
import { SessionHistoryItem } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import { getToken } from "@/actions/authentication";

function HistoryContent() {
  const { isAuthenticated } = useAuth();
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError("Unable to load your history right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSessionHistory();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Container size="xl" py="xl">
        <Box py="xl" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
          <Text ta="center" fw={500}>
            Please sign in to view your session history.
          </Text>
        </Box>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <Box py="xl">
          <Center>
            <Loader size="lg" />
          </Center>
          <Text mt="md" ta="center">
            Loading your history...
          </Text>
        </Box>
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
        <Title order={2}>Session History</Title>
        <Text c="dimmed" mt="xs" size="sm">
          A record of every tutoring session you&apos;ve completed.
        </Text>
      </Box>

      <SessionHistoryTab sessionHistory={sessionHistory} onReviewClick={() => {}} />
    </Container>
  );
}

export default function HistoryPage() {
  return (
    <PageWrapper>
      <HistoryContent />
    </PageWrapper>
  );
}

