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
} from "@mantine/core";
import { 
  BookOpen, 
  User, 
  Calendar, 
  Video, 
  MessageSquare,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { routes } from "../../routes";

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
    title: "Scheduling & Sessions",
    icon: <Calendar size={24} />,
    color: "teal",
    questions: [
      {
        question: "How do I schedule a tutoring session?",
        answer: "To schedule a session, go to the 'Find Sessions' page, select your subject, choose a tutor, and pick an available time slot from their calendar. You'll receive a confirmation email with the session details."
      },
      {
        question: "Can I reschedule or cancel a session?",
        answer: "Yes, you can reschedule or cancel a session up to 24 hours before the scheduled time. Go to your 'Upcoming Sessions' page to make changes to your bookings."
      },
      {
        question: "What happens if I miss a session?",
        answer: "If you miss a session without prior cancellation, it will be marked as a no-show. Multiple no-shows may affect your ability to book future sessions. We recommend canceling in advance if you can't attend."
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
        answer: "If you experience technical issues, try refreshing your browser first. If the problem persists, you can contact our technical support team through the 'Help' section or email support@lausdtutoring.org."
      },
      {
        question: "How do I test my audio and video before a session?",
        answer: "You can test your audio and video settings in your account settings under the 'Technical Setup' section. We recommend doing this before your first session to ensure everything works properly."
      }
    ]
  }
];

export default function FAQPage() {
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
                Find answers to common questions about our tutoring services, scheduling, and technical support.
              </Text>
            </div>
          </Stack>
        </Container>
      </Box>

      {/* FAQ Categories */}
      <Box py={60}>
        <Container size="lg">
          <Stack gap="xl">
            {faqCategories.map((category) => (
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