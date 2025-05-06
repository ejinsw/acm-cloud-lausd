"use client";

import { Container, Title, Text, Avatar, Group, SimpleGrid } from '@mantine/core';
import { Card } from '@mantine/core';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    content: "The LAUSD tutoring program has been invaluable for my daughter. Her math scores improved significantly, and she's now more confident in class.",
    author: "Maria Rodriguez",
    role: "Parent of 7th Grader",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    content: "I was struggling with science until I started working with my LAUSD tutor. Now I understand the concepts better and my grades have improved from C's to A's.",
    author: "James Wilson",
    role: "11th Grade Student",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    content: "As a teacher, I've seen remarkable progress in students who participate in the tutoring program. The individualized attention makes a huge difference.",
    author: "Dr. Sarah Johnson",
    role: "LAUSD Science Teacher",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    content: "My son was reluctant to get tutoring at first, but the program matched him with a tutor who connected with him. His reading comprehension has improved tremendously.",
    author: "Robert Chen",
    role: "Parent of 4th Grader",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    content: "The flexibility of online and in-person options has made it possible for me to get the help I need despite my busy extracurricular schedule.",
    author: "Sophia Martinez",
    role: "9th Grade Student",
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
  },
  {
    content: "The tutoring program has been essential for helping my students catch up after pandemic learning loss. I recommend it to all parents at our school.",
    author: "Michael Thompson",
    role: "LAUSD Elementary Principal",
    avatar: "https://randomuser.me/api/portraits/men/41.jpg",
  },
];

function TestimonialCard({ content, author, role, avatar }: typeof testimonials[0]) {
  return (
    <Card withBorder radius="md" p="xl" className="h-full">
      <div
        className="bg-blue-50 p-4 mb-4 flex items-center justify-center"
      >
        <Quote size={38} className="text-blue-600" strokeWidth={1.5} />
      </div>

      <Text size="md" mt="md" className="italic">
        {content}
      </Text>

      <Group mt="xl">
        <Avatar src={avatar} radius="xl" />
        <div>
          <Text fw={600} size="sm">
            {author}
          </Text>
          <Text size="xs" c="dimmed">
            {role}
          </Text>
        </div>
      </Group>
    </Card>
  );
}

export function TestimonialsSection() {
  const cards = testimonials.map((testimonial) => (
    <TestimonialCard key={testimonial.author} {...testimonial} />
  ));

  return (
    <section id="testimonials" className="py-16 md:py-20 bg-white">
      <Container size="xl">
        <div className="text-center mb-12">
          <Title className="text-gray-900 mb-3">
            What Our Community Says
          </Title>
          <Text c="dimmed" size="lg" mx="auto" className="max-w-2xl">
            Hear from students, parents, and teachers about their experiences with our tutoring program.
          </Text>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {cards}
        </SimpleGrid>
      </Container>
    </section>
  );
} 