"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Container,
  Title,
  Paper,
  Tabs,
  Text,
  Group,
  Box,
  Button,
  Loader,
  Alert,
} from "@mantine/core";
import { Search, Sparkles, BookOpen, Calendar, AlertCircle, MessageCircle, Play } from "lucide-react";
import Link from "next/link";
import { routes } from "@/app/routes";
import { StatsGrid } from "@/components/dashboard/instructor/StatsGrid";
import { UpcomingSessionsTab } from "@/components/dashboard/instructor/UpcomingSessionsTab";
import { SessionManagementTab } from "@/components/dashboard/instructor/SessionManagementTab";
import { SessionRequestsManager } from "@/components/dashboard/instructor/SessionRequestsManager";
import { ActiveSessionManager } from "@/components/dashboard/instructor/ActiveSessionManager";
import PageWrapper from "@/components/PageWrapper";
import { useAuth } from "@/components/AuthProvider";
import { Session } from "@/lib/types";
import { getToken } from "@/actions/authentication";

function InstructorDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Data states
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get initial tab from URL or default to "overview"
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState<string | null>(initialTab);

  // Fetch instructor sessions
  const fetchInstructorSessions = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/sessions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions');
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await fetchInstructorSessions();
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", activeTab);
      router.push(`?${params.toString()}`);
    }
  }, [activeTab, router, searchParams]);

  // Calculate statistics
  const upcomingSessions = sessions.filter(session => 
    session.status === 'SCHEDULED' || session.status === 'IN_PROGRESS'
  );
  const completedSessions = sessions.filter(session => 
    session.status === 'COMPLETED'
  );
  const totalSessions = sessions.length;
  const totalStudents = new Set(
    sessions.flatMap(session => 
      session.students?.map(student => student.id) || []
    )
  ).size;
  
  const hoursTutored = Math.round(completedSessions.reduce((total, session) => {
    if (session.startTime && session.endTime) {
      const start = new Date(session.startTime).getTime();
      const end = new Date(session.endTime).getTime();
      return total + (end - start) / (1000 * 60 * 60); // Convert to hours
    }
    return total;
  }, 0));
  
  const averageRating = user?.averageRating || 0;

  const statsData = {
    totalStudents,
    hoursTutored,
    averageRating,
    totalSessions,
  };

  // Handle session updates
  const handleSessionUpdate = () => {
    fetchInstructorSessions();
  };

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <Paper p="xl" radius="md" withBorder>
          <Box ta="center" py="xl">
            <Loader size="lg" />
            <Text mt="md">Loading your dashboard...</Text>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Paper p="xl" radius="md" withBorder>
          <Alert icon={<AlertCircle size={16} />} title="Error" color="red">
            {error}
          </Alert>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Paper p="xl" radius="md" withBorder mb="xl">
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={2}>Instructor Dashboard</Title>
            <Text c="dimmed">Manage your tutoring sessions and track your progress</Text>
          </div>
          <Button 
            component={Link} 
            href={routes.createSession} 
            leftSection={<Search size={18} />}
          >
            Create New Session
          </Button>
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<Sparkles size={16} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="sessions" leftSection={<BookOpen size={16} />}>
              My Sessions ({totalSessions})
            </Tabs.Tab>
            <Tabs.Tab value="requests" leftSection={<MessageCircle size={16} />}>
              Session Requests
            </Tabs.Tab>
            <Tabs.Tab value="active" leftSection={<Play size={16} />}>
              Active Sessions
            </Tabs.Tab>
            <Tabs.Tab value="schedule" leftSection={<Calendar size={16} />}>
              Schedule ({upcomingSessions.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview">
            <Box pt="md">
              <StatsGrid {...statsData} />
              
              <UpcomingSessionsTab sessions={sessions} />
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="sessions">
            <Box pt="md">
              <SessionManagementTab 
                sessions={sessions} 
                onSessionUpdate={handleSessionUpdate}
              />
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="requests">
            <Box pt="md">
              <SessionRequestsManager onSessionUpdate={handleSessionUpdate} />
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="active">
            <Box pt="md">
              <ActiveSessionManager 
                sessions={sessions} 
                onSessionUpdate={handleSessionUpdate}
              />
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="schedule">
            <Box pt="md">
              <UpcomingSessionsTab sessions={sessions} />
            </Box>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
}

export default function InstructorDashboard() {
  return (
    <PageWrapper>
      <InstructorDashboardContent />
    </PageWrapper>
  );
} 