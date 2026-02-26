"use client";

import {
  Container,
  Title,
  Text,
  Box,
  Paper,
  Stack,
  Accordion,
  ThemeIcon,
  Group,
  Button,
  Divider,
  TextInput,
} from "@mantine/core";
import { 
  BookOpen, 
  User, 
  Calendar, 
  Video, 
  MessageSquare,
  ArrowLeft,
  Search
} from "lucide-react";
import Link from "next/link";
import { routes } from "../../routes";
import { useMemo, useState } from "react";

// FAQ categories and questions
const faqCategories = [
  {
    title: "Getting Started",
    icon: <BookOpen size={24} />,
    color: "blue",
    questions: [
      {
        question: "How do I sign up for tutoring sessions?",
        answer: "To sign up for tutoring sessions, create an account on our platform, browse available tutors and subjects, and book a session that fits your schedule. You can filter by subject, grade level, and availability."
      },
      {
        question: "What subjects are available for tutoring?",
        answer: "We offer tutoring in a wide range of subjects including Mathematics, Science, English, History, Spanish, and Programming. Each subject has multiple tutors available with different specializations."
      },
      {
        question: "How do I choose the right tutor?",
        answer: "You can browse tutor profiles to see their qualifications, experience, ratings, and reviews from other students. Each profile includes their teaching style, subjects they specialize in, and their availability."
      }
    ]
  },
  {
    title: "Account & Profile",
    icon: <User size={24} />,
    color: "violet",
    questions: [
      {
        question: "How do I update my profile information?",
        answer: "You can update your profile information by going to your account settings. Click on your profile picture in the top right corner and select 'Account Settings' to modify your personal information."
      },
      {
        question: "Can I change my email or password?",
        answer: "Yes, you can change your email and password in your account settings. Go to the 'Security' tab in your account settings to make these changes."
      },
      {
        question: "How do I manage my notification preferences?",
        answer: "You can manage your notification preferences in your account settings under the 'Notifications' tab. Here you can choose which types of notifications you want to receive and how you want to receive them."
      }
    ]
  },
  {
    title: "Queue & Sessions",
    icon: <Calendar size={24} />,
    color: "teal",
    questions: [
      {
        question: "How do I start a tutoring session?",
        answer: "Open the queue, pick your subject, and describe your question. When an instructor accepts, you are redirected directly into a live session."
      },
      {
        question: "Can I cancel my request?",
        answer: "Yes. While waiting in queue, use 'Leave Queue' to cancel your request immediately."
      },
      {
        question: "What happens if I disconnect during a session?",
        answer: "Re-open the same session link and you can rejoin. Chat history and participant state are synced in real time."
      }
    ]
  },
  {
    title: "Technical Support",
    icon: <Video size={24} />,
    color: "orange",
    questions: [
      {
        question: "What are the technical requirements for online sessions?",
        answer: "You'll need a stable internet connection, a webcam, and a microphone. We recommend using Chrome or Firefox browsers for the best experience. A quiet, well-lit environment is also recommended."
      },
      {
        question: "What should I do if I have technical issues during a session?",
        answer: "If you experience technical issues, refresh your browser first. If the problem persists, contact support through the Help section or email support@tutoringapp.org."
      },
      {
        question: "How do I test my audio and video before a session?",
        answer: "Test your device audio/video in your browser settings before joining. We recommend checking your setup a few minutes early."
      }
    ]
  }
];

export default function FAQPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      faqCategories
        .map((category) => ({
          ...category,
          questions: category.questions.filter((q) =>
            `${q.question} ${q.answer}`.toLowerCase().includes(query.toLowerCase()),
          ),
        }))
        .filter((category) => category.questions.length > 0),
    [query],
  );

  return (
    <main>
      {/* Hero Section */}
      <Box py={80} style={{ backgroundColor: "#f8f9fa" }}>
        <Container size="lg">
          <Stack gap="xl" align="center">
            <div style={{ textAlign: "center" }}>
              <Title order={1} size="h1" fw={900} mb="md">
                Frequently Asked Questions
              </Title>
              <Text size="lg" c="dimmed" maw={600} mx="auto">
                Find answers to common questions about queue requests, live sessions, and technical support.
              </Text>
              <TextInput
                mt="lg"
                leftSection={<Search size={16} />}
                placeholder="Search FAQs"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
              />
            </div>
          </Stack>
        </Container>
      </Box>

      {/* FAQ Categories */}
      <Box py={60}>
        <Container size="lg">
          <Stack gap="xl">
            {filtered.map((category) => (
              <Paper key={category.title} radius="md" p="xl" withBorder>
                <Stack gap="xl">
                  <Group gap="md">
                    <ThemeIcon size={50} radius="md" color={category.color}>
                      {category.icon}
                    </ThemeIcon>
                    <div>
                      <Title order={2} size="h3">
                        {category.title}
                      </Title>
                    </div>
                  </Group>
                  <Divider />
                  <Accordion>
                    {category.questions.map((item) => (
                      <Accordion.Item key={item.question} value={item.question}>
                        <Accordion.Control>
                          <Text fw={500}>{item.question}</Text>
                        </Accordion.Control>
                        <Accordion.Panel>
                          <Text c="dimmed">{item.answer}</Text>
                        </Accordion.Panel>
                      </Accordion.Item>
                    ))}
                  </Accordion>
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
                  Still Need Help?
                </Title>
                <Text size="lg" c="dimmed" maw={600} mx="auto">
                  Can&apos;t find what you&apos;re looking for? Our support team is here to help.
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
