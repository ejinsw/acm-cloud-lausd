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

// FAQ categories and questions (logistical & technical only)
const faqCategories = [
  {
    title: "Account & Profile",
    icon: <User size={24} />,
    color: "violet",
    questions: [
      {
        question: "How do I update my profile?",
        answer: "Go to account settings to update your name, email, and other details."
      },
      {
        question: "How do I change my password?",
        answer: "Use the Security section in account settings to change your password."
      },
      {
        question: "How do I manage notifications?",
        answer: "Adjust notification preferences in your account settings."
      }
    ]
  },
  {
    title: "Queue & Sessions",
    icon: <Calendar size={24} />,
    color: "teal",
    questions: [
      {
        question: "How do I join the queue?",
        answer: "Open the queue for your session, pick a subject or topic, and add a short description. You’ll be matched when someone is available."
      },
      {
        question: "How do I leave the queue?",
        answer: "Use the 'Leave Queue' button while you’re waiting."
      },
      {
        question: "What if I get disconnected during a session?",
        answer: "Open the same session link again to rejoin. Your chat and session state will still be there."
      }
    ]
  },
  {
    title: "Technical",
    icon: <Video size={24} />,
    color: "orange",
    questions: [
      {
        question: "What do I need for sessions?",
        answer: "A stable internet connection, webcam, and microphone. Chrome or Firefox works best."
      },
      {
        question: "What if I have technical issues?",
        answer: "Refresh your browser first. If it continues, contact support from the Help or Contact page."
      },
      {
        question: "How do I test my camera and microphone?",
        answer: "Check your browser or device settings before joining. Test a few minutes before your session."
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
                Find answers to common questions about using the app.
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
