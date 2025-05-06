"use client";

import { Container, Title, Grid, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { SessionCard } from '@/components/sessions/SessionCard';
import { SearchBar, SearchParams } from '@/components/sessions/SearchBar';
import { Session } from '@/lib/types';

// Mock subjects for demo purposes
const subjectOptions = [
  { value: '1', label: 'Mathematics' },
  { value: '2', label: 'English' },
  { value: '3', label: 'Science' },
  { value: '4', label: 'History' },
  { value: '5', label: 'Computer Science' },
];

// Mock sessions data
const mockSessions: Session[] = [
  {
    id: '1',
    name: 'Algebra Fundamentals',
    description: 'Learn the basics of algebra in this interactive session. Perfect for beginners!',
    startTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    maxAttendees: 10,
    instructorId: '101',
    instructor: {
      id: '101',
      firstName: 'Alex',
      lastName: 'Johnson',
      averageRating: 4.8,
      email: 'alex.johnson@example.com',
    },
    subjects: [
      { id: '1', name: 'Mathematics' }
    ]
  },
  {
    id: '2',
    name: 'Advanced Calculus',
    description: 'Deep dive into calculus concepts including integration and differentiation.',
    startTime: new Date(Date.now() + 172800000).toISOString(), // day after tomorrow
    maxAttendees: 8,
    instructorId: '102',
    instructor: {
      id: '102',
      firstName: 'Sarah',
      lastName: 'Williams',
      averageRating: 4.9,
      email: 'sarah.w@example.com',
    },
    subjects: [
      { id: '1', name: 'Mathematics' }
    ]
  },
  {
    id: '3',
    name: 'Creative Writing Workshop',
    description: 'Develop your creative writing skills with professional guidance.',
    startTime: new Date(Date.now() + 259200000).toISOString(), // three days from now
    maxAttendees: 15,
    instructorId: '103',
    instructor: {
      id: '103',
      firstName: 'Michael',
      lastName: 'Brown',
      averageRating: 4.7,
      email: 'michael.b@example.com',
    },
    subjects: [
      { id: '2', name: 'English' }
    ]
  },
  {
    id: '4',
    name: 'Physics Problem Solving',
    description: 'Practice solving complex physics problems with step-by-step guidance.',
    startTime: new Date(Date.now() + 345600000).toISOString(), // four days from now
    maxAttendees: 12,
    instructorId: '104',
    instructor: {
      id: '104',
      firstName: 'Emily',
      lastName: 'Davis',
      averageRating: 4.6,
      email: 'emily.d@example.com',
    },
    subjects: [
      { id: '3', name: 'Science' }
    ]
  },
  {
    id: '5',
    name: 'World History Overview',
    description: 'Explore key events and periods in world history with an engaging instructor.',
    startTime: new Date(Date.now() + 432000000).toISOString(), // five days from now
    maxAttendees: 20,
    instructorId: '105',
    instructor: {
      id: '105',
      firstName: 'James',
      lastName: 'Wilson',
      averageRating: 4.5,
      email: 'james.w@example.com',
    },
    subjects: [
      { id: '4', name: 'History' }
    ]
  },
  {
    id: '6',
    name: 'Introduction to Programming',
    description: 'Learn the basics of programming concepts and start coding in Python.',
    startTime: new Date(Date.now() + 518400000).toISOString(), // six days from now
    maxAttendees: 15,
    instructorId: '106',
    instructor: {
      id: '106',
      firstName: 'Jessica',
      lastName: 'Miller',
      averageRating: 4.9,
      email: 'jessica.m@example.com',
    },
    subjects: [
      { id: '5', name: 'Computer Science' }
    ]
  }
];

export default function ExploreSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>(mockSessions);
  const [isLoading, setIsLoading] = useState(false);

  // In a real app, this would fetch sessions from an API
  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setSessions(mockSessions);
      setFilteredSessions(mockSessions);
      setIsLoading(false);
    }, 500);
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
          if (params.searchBy === 'name') {
            return session.name.toLowerCase().includes(searchQuery);
          } else if (params.searchBy === 'subject') {
            return session.subjects?.some(subject => 
              subject.name.toLowerCase().includes(searchQuery)
            );
          } else if (params.searchBy === 'description' && session.description) {
            return session.description.toLowerCase().includes(searchQuery);
          }
          return true;
        });
      }
      
      // Filter by selected subjects
      if (params.subjects && params.subjects.length > 0) {
        filtered = filtered.filter(session => 
          session.subjects?.some(subject => 
            params.subjects?.includes(subject.id)
          )
        );
      }
      
      // Sort results if needed
      if (params.sortBy) {
        filtered.sort((a, b) => {
          if (params.sortBy === 'date' && a.startTime && b.startTime) {
            return params.sortDirection === 'asc' 
              ? new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
              : new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
          } else if (params.sortBy === 'rating') {
            const ratingA = a.instructor?.averageRating || 0;
            const ratingB = b.instructor?.averageRating || 0;
            return params.sortDirection === 'asc' ? ratingA - ratingB : ratingB - ratingA;
          }
          return 0;
        });
      }
      
      setFilteredSessions(filtered);
      setIsLoading(false);
    }, 300);
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">Explore Sessions</Title>
      
      <SearchBar 
        variant="advanced"
        subjectOptions={subjectOptions}
        onSearch={handleSearch}
        className="mb-8"
      />
      
      {isLoading ? (
        <Text>Loading sessions...</Text>
      ) : filteredSessions.length > 0 ? (
        <Grid>
          {filteredSessions.map(session => (
            <Grid.Col key={session.id} span={{ base: 12, sm: 6, md: 4 }}>
              {session.instructor && (
                <SessionCard 
                  id={session.id}
                  name={session.name}
                  description={session.description}
                  startTime={session.startTime ? new Date(session.startTime) : undefined}
                  instructor={session.instructor}
                  subjects={session.subjects || []}
                />
              )}
            </Grid.Col>
          ))}
        </Grid>
      ) : (
        <Text>No sessions found matching your criteria.</Text>
      )}
    </Container>
  );
} 