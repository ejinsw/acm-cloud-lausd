"use client";

import { Container, Title, Grid, Loader, Center, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { SessionCard } from '@/components/sessions/SessionCard';
import { SearchBar, SearchParams } from '@/components/sessions/SearchBar';
import { Session } from '@/lib/types';
import PageWrapper from '@/components/PageWrapper';
import { getToken } from '@/actions/authentication';

function ExploreSessionsContent() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const fetchSessions = async () => {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setSessions(data.sessions);
      setFilteredSessions(data.sessions ?? []);
      setIsLoading(false);
    }
    fetchSessions();
  }, []);

  const handleSearch = (params: SearchParams) => {
    setIsLoading(true);
    
    // Simple client-side filtering for demo
    // In a real app, this would be a server-side API call
    setTimeout(() => {
      let filtered = [...sessions];
      
      // Filter by search query
      if (params.query) {
        const searchQuery = params.query.toLowerCase();
        filtered = filtered.filter(session => {
          if (params.searchBy === 'session') {
            return session.name.toLowerCase().includes(searchQuery);
          } else if (params.searchBy === 'instructor') {
            return session.instructor?.firstName?.toLowerCase().includes(searchQuery) || session.instructor?.lastName?.toLowerCase().includes(searchQuery)
          }
          return true;
        });
      }
      
      setFilteredSessions(filtered);
      setIsLoading(false);
    }, 300);
  };

  return (
    <Container size="xl" py="xl" className="flex flex-col gap-8">
      <Title order={1}>Explore Sessions</Title>
      
      <SearchBar
        onSearch={handleSearch}
        isLoading={isLoading}
        disabled={isLoading}
      />
      
      {isLoading ? (
        <Center py="xl">
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text size="lg" c="dimmed">Loading sessions...</Text>
          </Stack>
        </Center>
      ) : filteredSessions.length > 0 ? (
        <Grid>
          {filteredSessions.map((session) => (
            <Grid.Col key={session.id} span={{ base: 12, sm: 6, md: 4 }}>
              <SessionCard
                id={session.id}
                name={session.name}
                description={session.description}
                startTime={session.startTime ? new Date(session.startTime) : undefined}
                instructor={session.instructor || { id: session.instructorId }}
                subjects={session.subjects || []}
              />
            </Grid.Col>
          ))}
        </Grid>
      ) : (
        <Center py="xl">
          <Text size="lg" c="dimmed">No sessions found matching your criteria.</Text>
        </Center>
      )}
    </Container>
  );
}

export default function ExploreSessionsPage() {
  return (
    <PageWrapper>
      <ExploreSessionsContent />
    </PageWrapper>
  );
} 