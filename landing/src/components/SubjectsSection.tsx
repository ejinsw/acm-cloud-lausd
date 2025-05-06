"use client";

import { Container, Title, Text, Group, Badge, Button, SimpleGrid } from '@mantine/core';
import { Card } from '@mantine/core';
import { Calculator, FlaskConical, BookText, Globe, Languages, LineChart } from 'lucide-react';

const subjects = [
  {
    title: 'Mathematics',
    category: 'Core',
    levels: ['Elementary', 'Middle School', 'High School'],
    description: 'From basic arithmetic to calculus, our tutors can help with all levels of mathematics.',
    icon: <Calculator size={28} className="text-blue-600" strokeWidth={1.5} />,
  },
  {
    title: 'Science',
    category: 'Core',
    levels: ['Elementary', 'Middle School', 'High School'],
    description: 'Biology, chemistry, physics, and earth science tutoring for all grade levels.',
    icon: <FlaskConical size={28} className="text-blue-600" strokeWidth={1.5} />,
  },
  {
    title: 'English Language Arts',
    category: 'Core',
    levels: ['Elementary', 'Middle School', 'High School'],
    description: 'Reading comprehension, writing, grammar, literature, and composition skills.',
    icon: <BookText size={28} className="text-blue-600" strokeWidth={1.5} />,
  },
  {
    title: 'Social Studies',
    category: 'Core',
    levels: ['Elementary', 'Middle School', 'High School'],
    description: 'History, geography, civics, economics, and world cultures tutoring.',
    icon: <Globe size={28} className="text-blue-600" strokeWidth={1.5} />,
  },
  {
    title: 'Foreign Languages',
    category: 'Elective',
    levels: ['Middle School', 'High School'],
    description: 'Spanish, French, and other language tutoring for beginners to advanced students.',
    icon: <Languages size={28} className="text-blue-600" strokeWidth={1.5} />,
  },
  {
    title: 'Test Preparation',
    category: 'Special',
    levels: ['Middle School', 'High School'],
    description: 'SAT, ACT, AP exams, and standardized testing preparation.',
    icon: <LineChart size={28} className="text-blue-600" strokeWidth={1.5} />,
  },
];

export function SubjectsSection() {
  const items = subjects.map((subject) => (
    <Card key={subject.title} withBorder radius="md" p="md" className="transition-transform hover:scale-105">
      <div className="flex items-center gap-3 border-b border-gray-200 py-2 px-3 mb-2">
        {subject.icon}
        <Title order={3} fw={600} size="h4">
          {subject.title}
        </Title>
      </div>

      <div className="border-b border-gray-200 py-2 px-3 mb-2">
        <Group>
          <Badge color={subject.category === 'Core' ? 'blue' : subject.category === 'Elective' ? 'green' : 'orange'}>
            {subject.category}
          </Badge>
          {subject.levels.map((level) => (
            <Badge key={level} color="gray" variant="outline">
              {level}
            </Badge>
          ))}
        </Group>
      </div>

      <Text mt="sm" mb="md" size="sm" c="dimmed" px={3}>
        {subject.description}
      </Text>

      <Button fullWidth variant="light" color="blue">
        Find a Tutor
      </Button>
    </Card>
  ));

  return (
    <section id="subjects" className="py-16 md:py-20 bg-gray-50">
      <Container size="xl">
        <div className="text-center mb-12">
          <Title className="text-gray-900 mb-3">
            Subjects We Offer
          </Title>
          <Text c="dimmed" size="lg" mx="auto" className="max-w-2xl">
            Our tutors specialize in a wide range of subjects across all grade levels to help students excel in their academic journey.
          </Text>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {items}
        </SimpleGrid>
      </Container>
    </section>
  );
} 