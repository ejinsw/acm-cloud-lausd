"use client";

import {
  Container,
  Title,
  Text,
  Box,
  Paper,
  Stack,
  ThemeIcon,
  Group,
  Button,
  List,
  Divider,
} from "@mantine/core";
import { 
  BookOpen, 
  User, 
  Calendar, 
  Video, 
  MessageSquare,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { routes } from "../../routes";

const steps = [
  {
    title: "Create Your Account",
    description: "Get started by creating your account and setting up your profile.",
    icon: <User size={24} />,
    color: "blue",
    details: [
      "Click the 'Sign Up' button in the top right corner",
      "Enter your email address and create a password",
      "Fill in your basic information (name, grade level, etc.)",
      "Verify your email address",
      "Complete your profile with additional details"
    ]
  },
  {
    title: "Set Up Your Profile",
    description: "Customize your profile to help us match you with the right tutor.",
    icon: <User size={24} />,
    color: "violet",
    details: [
      "Add your academic interests and goals",
      "Specify subjects you need help with",
      "Set your preferred learning style",
      "Upload a profile picture (optional)",
      "Set your notification preferences"
    ]
  },
  {
    title: "Find a Tutor",
    description: "Browse and select a tutor that matches your needs.",
    icon: <BookOpen size={24} />,
    color: "teal",
    details: [
      "Use the search filters to find tutors by subject",
      "Read tutor profiles and reviews",
      "Check tutor availability and qualifications",
      "Compare different tutors' teaching styles",
      "Save your favorite tutors for quick access"
    ]
  },
  {
    title: "Schedule Your First Session",
    description: "Book your first tutoring session at a time that works for you.",
    icon: <Calendar size={24} />,
    color: "orange",
    details: [
      "Select your preferred tutor",
      "Choose a date and time from their calendar",
      "Select the session duration (30 or 60 minutes)",
      "Add any specific topics you want to cover",
      "Confirm your booking"
    ]
  },
  {
    title: "Prepare for Your Session",
    description: "Get ready for your first tutoring session.",
    icon: <Video size={24} />,
    color: "grape",
    details: [
      "Test your audio and video equipment",
      "Find a quiet, well-lit space",
      "Have your materials ready (textbooks, notes, etc.)",
      "Prepare any questions you want to ask",
      "Join the session 5 minutes early"
    ]
  }
];

export default function GettingStartedPage() {
  return (
    <main>
      {/* Hero Section */}
      <Box py={80} style={{ backgroundColor: "#f8f9fa" }}>
        <Container size="lg">
          <Stack gap="xl" align="center">
            <div style={{ textAlign: "center" }}>
              <Title order={1} size="h1" fw={900} mb="md">
                Getting Started Guide
              </Title>
              <Text size="lg" c="dimmed" maw={600} mx="auto">
                Follow these simple steps to begin your tutoring journey with us.
              </Text>
            </div>
          </Stack>
        </Container>
      </Box>

      {/* Steps Section */}
      <Box py={60}>
        <Container size="lg">
          <Stack gap="xl">
            {steps.map((step, index) => (
              <Paper key={step.title} radius="md" p="xl" withBorder>
                <Stack gap="xl">
                  <Group gap="md">
                    <ThemeIcon size={50} radius="md" color={step.color}>
                      {step.icon}
                    </ThemeIcon>
                    <div>
                      <Group gap="xs">
                        <Text fw={700} size="xl" c={step.color}>
                          Step {index + 1}
                        </Text>
                        <Title order={2} size="h3">
                          {step.title}
                        </Title>
                      </Group>
                      <Text c="dimmed" mt={4}>
                        {step.description}
                      </Text>
                    </div>
                  </Group>
                  <Divider />
                  <List
                    spacing="sm"
                    size="sm"
                    icon={
                      <ThemeIcon color={step.color} size={20} radius="xl">
                        <CheckCircle2 size={14} />
                      </ThemeIcon>
                    }
                  >
                    {step.details.map((detail) => (
                      <List.Item key={detail}>{detail}</List.Item>
                    ))}
                  </List>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Help Section */}
      <Box py={80} style={{ backgroundColor: "#f8f9fa" }}>
        <Container size="lg">
          <Paper radius="md" p={40} withBorder>
            <Stack gap="xl" align="center">
              <div style={{ textAlign: "center" }}>
                <Title order={2} mb="md">
                  Need Additional Help?
                </Title>
                <Text size="lg" c="dimmed" maw={600} mx="auto">
                  Our support team is here to help you get started. Don&apos;t hesitate to reach out.
                </Text>
              </div>
              <Group>
                <Button
                  component={Link}
                  href={routes.contact}
                  size="lg"
                  rightSection={<MessageSquare size={16} />}
                  radius="md"
                >
                  Contact Support
                </Button>
                <Button
                  component={Link}
                  href={routes.home}
                  variant="outline"
                  size="lg"
                  leftSection={<ArrowLeft size={16} />}
                  radius="md"
                >
                  Back to Home
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </main>
  );
} 