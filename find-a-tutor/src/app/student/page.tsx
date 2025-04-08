"use client";

import { Box, Card, Group, Text, Space, Badge, Avatar, Button, Rating, Stack, Container, Grid, Title } from '@mantine/core';
import { SearchBar, SearchParams } from "./SearchBar";
import { useState } from 'react';

interface TutorProfile {
  id: string;
  name: string;
  university: string;
  subjects: string[];
  description: string;
  yearsOfTutoring: number;
  location: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
}

function TutorCard({ tutor }: { tutor: TutorProfile }) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
      <Group wrap="nowrap" align="flex-start">
        <Stack align="center" gap={4}>
          <Avatar
            src={tutor.imageUrl}
            size={120}
            radius="md"
          />
          <Text size="sm" c="dimmed">{tutor.yearsOfTutoring} years of tutoring</Text>
          <Text size="sm" c="dimmed">{tutor.location}</Text>
        </Stack>
        <Box style={{ flex: 1 }}>
          <Group justify="space-between" wrap="nowrap">
            <Box>
              <Text fw={500} size="lg">{tutor.name}</Text>
              <Text size="sm" c="dimmed">{tutor.university}</Text>
            </Box>
            <Group gap="xs" wrap="nowrap">
              <Rating value={tutor.rating} readOnly />
              <Text size="sm">({tutor.reviewCount})</Text>
              <Text fw={500} size="xl">USD ${tutor.hourlyRate}/hr</Text>
            </Group>
          </Group>

          <Group mt="xs" gap="xs">
            {tutor.subjects.map((subject) => (
              <Badge key={subject} variant="light" color="blue">
                {subject}
              </Badge>
            ))}
          </Group>

          <Text mt="sm" size="sm" lineClamp={2}>
            {tutor.description}
          </Text>
        </Box>
      </Group>

      <Button fullWidth mt="md" variant="filled">
        View profile
      </Button>
    </Card>
  );
}

// Boilerplate tutor data
const tutors: TutorProfile[] = [
  {
    id: '1',
    name: 'Farhad F.',
    university: 'University of British Columbia',
    subjects: ['Electrical Engineering', 'Machine Learning', 'Data Science', 'Python', 'Coding', 'Physics', 'Math', 'Statistics'],
    description: 'I have got my PhD in Electrical and Computer Engineering from UBC. I have 14+ years of tutoring and teaching experience in high schools, colleges, and universities. I was serving as a faculty member at Electrical Engineering Department of one of the Tehran\'s universities for 5 years....',
    yearsOfTutoring: 14,
    location: 'Vancouver, Canada',
    hourlyRate: 59,
    rating: 5,
    reviewCount: 11,
    imageUrl: '/tutors/farhad.jpg',
  },
  {
    id: '2',
    name: 'Sarah L.',
    university: 'Stanford University',
    subjects: ['Computer Science', 'Algorithms', 'Web Development', 'JavaScript', 'React', 'Node.js'],
    description: 'Software engineer at Google with 8 years of industry experience. I specialize in web development and algorithms. I enjoy breaking down complex concepts into simple, understandable pieces.',
    yearsOfTutoring: 6,
    location: 'San Francisco, USA',
    hourlyRate: 75,
    rating: 4.9,
    reviewCount: 28,
    imageUrl: '/tutors/sarah.jpg',
  },
  {
    id: '3',
    name: 'Michael C.',
    university: 'MIT',
    subjects: ['Mathematics', 'Calculus', 'Linear Algebra', 'Differential Equations', 'Statistics'],
    description: 'Mathematics PhD candidate at MIT. I have been tutoring for over 5 years, helping students master complex mathematical concepts. My teaching approach focuses on building strong foundations and problem-solving skills.',
    yearsOfTutoring: 5,
    location: 'Boston, USA',
    hourlyRate: 65,
    rating: 4.8,
    reviewCount: 19,
    imageUrl: '/tutors/michael.jpg',
  },
  {
    id: '4',
    name: 'Emily W.',
    university: 'University of Toronto',
    subjects: ['Biology', 'Chemistry', 'Biochemistry', 'Organic Chemistry', 'MCAT Prep'],
    description: 'MD-PhD student specializing in molecular biology. I have helped numerous pre-med students excel in their courses and MCAT preparation. My teaching style emphasizes understanding core concepts and their clinical applications.',
    yearsOfTutoring: 7,
    location: 'Toronto, Canada',
    hourlyRate: 70,
    rating: 5,
    reviewCount: 32,
    imageUrl: '/tutors/emily.jpg',
  },
  {
    id: '5',
    name: 'David K.',
    university: 'UC Berkeley',
    subjects: ['Physics', 'Quantum Mechanics', 'Thermodynamics', 'Classical Mechanics', 'Electromagnetism'],
    description: 'Physics professor with a passion for teaching. I specialize in making complex physics concepts accessible to students at all levels. Published researcher in quantum computing and condensed matter physics.',
    yearsOfTutoring: 12,
    location: 'Berkeley, USA',
    hourlyRate: 80,
    rating: 4.9,
    reviewCount: 45,
    imageUrl: '/tutors/david.jpg',
  },
  {
    id: '6',
    name: 'Lisa R.',
    university: 'Harvard University',
    subjects: ['Economics', 'Microeconomics', 'Macroeconomics', 'Econometrics', 'Statistics'],
    description: 'Economics PhD with extensive teaching experience. Former economic consultant at World Bank. I specialize in making economic concepts practical and relevant through real-world examples.',
    yearsOfTutoring: 9,
    location: 'Cambridge, USA',
    hourlyRate: 85,
    rating: 4.8,
    reviewCount: 23,
    imageUrl: '/tutors/lisa.jpg',
  }
];

export default function Page() {
  const [filteredTutors, setFilteredTutors] = useState(tutors);

  const handleSearch = ({ searchType, query }: SearchParams) => {
    if (!query.trim()) {
      setFilteredTutors(tutors);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const filtered = tutors.filter(tutor => {
      switch (searchType) {
        case 'name':
          return tutor.name.toLowerCase().includes(searchTerm);
        case 'subject':
          return tutor.subjects.some(subject => 
            subject.toLowerCase().includes(searchTerm)
          );
        default:
          return false;
      }
    });

    setFilteredTutors(filtered);
  };

  return (
    <Box>
      <Container size="lg" py="xl">
        <SearchBar onSearch={handleSearch} />
        <Space h="xl" />
        <Title order={2} mb="xl">Available Tutors</Title>
        <Stack gap="xl">
          {filteredTutors.length > 0 ? (
            filteredTutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))
          ) : (
            <Text ta="center" c="dimmed">No tutors found matching your search criteria.</Text>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
