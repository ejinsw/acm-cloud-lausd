"use client";

import { Container, Title, Text, SimpleGrid, ThemeIcon } from '@mantine/core';
import { GraduationCap, BookOpen, Puzzle, BarChart, Globe, Users } from 'lucide-react';
import { ReactNode } from 'react';

interface FeatureProps {
  title: string;
  description: string;
  icon: ReactNode;
}

function Feature({ title, description, icon }: FeatureProps) {
  return (
    <div>
      <ThemeIcon size={60} radius="md" className="mb-4 bg-blue-50 text-blue-600 border-0">
        {icon}
      </ThemeIcon>

      <Text fw={600} size="lg" mt="sm" mb="xs" className="text-gray-900">
        {title}
      </Text>

      <Text size="md" c="dimmed" lh={1.6}>
        {description}
      </Text>
    </div>
  );
}

const features = [
  {
    icon: <GraduationCap size={30} className="text-blue-600" strokeWidth={1.5} />,
    title: 'Qualified LAUSD Teachers',
    description:
      'All our tutors are certified teachers with experience in the LAUSD curriculum and teaching methods.',
  },
  {
    icon: <BookOpen size={30} className="text-blue-600" strokeWidth={1.5} />,
    title: 'Aligned with Curriculum',
    description:
      'Our tutoring sessions complement classroom instruction and follow LAUSD curriculum standards.',
  },
  {
    icon: <Puzzle size={30} className="text-blue-600" strokeWidth={1.5} />,
    title: 'Personalized Approach',
    description:
      'Each student receives an individualized learning plan tailored to their specific needs and learning style.',
  },
  {
    icon: <BarChart size={30} className="text-blue-600" strokeWidth={1.5} />,
    title: 'Progress Monitoring',
    description:
      'Regular assessments and feedback help track student growth and adjust strategies as needed.',
  },
  {
    icon: <Globe size={30} className="text-blue-600" strokeWidth={1.5} />,
    title: 'Online & In-Person Options',
    description:
      'Flexible tutoring formats to accommodate student schedules and learning preferences.',
  },
  {
    icon: <Users size={30} className="text-blue-600" strokeWidth={1.5} />,
    title: 'Parent-Teacher Collaboration',
    description:
      'We work closely with parents and classroom teachers to ensure consistent support for students.',
  },
];

export function FeaturesSection() {
  const items = features.map((feature) => <Feature {...feature} key={feature.title} />);

  return (
    <section id="tutoring" className="py-16 md:py-20 bg-white">
      <Container size="xl">
        <div className="text-center mb-12">
          <Title className="text-gray-900 mb-3">
            Why Choose LAUSD Tutoring Program
          </Title>
          <Text c="dimmed" size="lg" mx="auto" className="max-w-2xl">
            Our comprehensive tutoring program is designed to support students&apos; academic growth while building
            confidence and a love for learning.
          </Text>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={{ base: 'xl', md: 50 }}>
          {items}
        </SimpleGrid>
      </Container>
    </section>
  );
} 