"use client";

import { Title, Text, Container, Button, Group, Image, Box } from '@mantine/core';

export function HeroSection() {
  return (
    <section id="about" className="py-16 md:py-20 bg-[#F8FAFC]">
      <Container size="xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Box mb={10}>
              <Title order={1} size="h1" className="text-gray-900 mb-4 leading-tight">
                Empowering LAUSD Students <span className="text-blue-600">Through Personalized Tutoring</span>
              </Title>
              <Text size="lg" color="dimmed" className="mb-6">
                Connect with qualified teachers to excel in your classes, improve your grades, and reach your full academic potential.
              </Text>
            </Box>

            <Group>
              <Button size="lg" color="blue">
                Find a Tutor
              </Button>
              <Button size="lg" variant="outline" color="gray">
                Learn More
              </Button>
            </Group>

            <div className="mt-10 flex gap-6 items-center">
              <div>
                <Text size="xl" fw={700} className="text-blue-600">5000+</Text>
                <Text size="sm" color="dimmed">Students Tutored</Text>
              </div>
              <div className="h-8 w-px bg-gray-300" />
              <div>
                <Text size="xl" fw={700} className="text-blue-600">98%</Text>
                <Text size="sm" color="dimmed">Satisfaction Rate</Text>
              </div>
              <div className="h-8 w-px bg-gray-300" />
              <div>
                <Text size="xl" fw={700} className="text-blue-600">300+</Text>
                <Text size="sm" color="dimmed">Expert Tutors</Text>
              </div>
            </div>
          </div>

          <div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1232&q=80"
              alt="Students studying with teacher"
              style={{ objectFit: 'cover', height: '100%', width: '100%' }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/80 to-transparent p-6">
              <Text color="white" fw={600} className="text-lg">
                &ldquo;Our tutors are committed to student success&rdquo;
              </Text>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
} 