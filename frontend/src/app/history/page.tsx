"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Title,
  Text,
  Loader,
  Alert,
  Box,
  Center,
  SegmentedControl,
  Stack,
  Card,
} from "@mantine/core";
import { AlertCircle } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { SessionHistoryTab } from "@/components/dashboard/student/SessionHistoryTab";
import { SessionHistoryItem } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import { getToken } from "@/actions/authentication";

type HistoryFilter = "all" | "reviewed" | "pending";

function HistoryContent() {
  const { isAuthenticated } = useAuth();
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<HistoryFilter>("all");

  const filtered = useMemo(() => {
    if (filter === "reviewed") return sessionHistory.filter((item) => !!item.relatedReview);
    if (filter === "pending") return sessionHistory.filter((item) => !item.relatedReview);
    return sessionHistory;
  }, [filter, sessionHistory]);

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
      <Box py="xl">
        <Box py="xl" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
          <Text ta="center" fw={500}>
            Please sign in to view your session history.
          </Text>
        </Box>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box py="xl">
        <Box py="xl">
          <Center>
            <Loader size="lg" />
          </Center>
          <Text mt="md" ta="center">
            Loading your history...
          </Text>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box py="xl">
        <Alert icon={<AlertCircle size={16} />} title="Error" color="red">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Stack py="lg" className="app-page-grid">
      <Card className="app-glass" p="xl">
        <Title order={2}>Session Timeline</Title>
        <Text c="dimmed" mt="xs" size="sm">
          Organized by date with review status and direct follow-up actions.
        </Text>
        <SegmentedControl
          mt="md"
          value={filter}
          onChange={(value) => setFilter(value as HistoryFilter)}
          data={[
            { label: `All (${sessionHistory.length})`, value: "all" },
            { label: `Reviewed (${sessionHistory.filter((item) => !!item.relatedReview).length})`, value: "reviewed" },
            { label: `Pending (${sessionHistory.filter((item) => !item.relatedReview).length})`, value: "pending" },
          ]}
        />
      </Card>

      <SessionHistoryTab sessionHistory={filtered} onReviewClick={() => {}} />
    </Stack>
  );
}

export default function HistoryPage() {
  return (
    <PageWrapper>
      <HistoryContent />
    </PageWrapper>
  );
}
