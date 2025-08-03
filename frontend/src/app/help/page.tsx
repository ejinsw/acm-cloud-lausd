"use client";

import {
  Container,
  Title,
  Text,
  Box,
  Paper,
  Stack,
  SimpleGrid,
  ThemeIcon,
  Group,
  Button,
} from "@mantine/core";
import {  
  MessageSquare, 
  HelpCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { routes } from "../routes";

const helpSections = [
  {
    title: "FAQs",
    description: "Find answers to frequently asked questions about our tutoring services.",
    icon: <HelpCircle size={24} />,
    color: "blue",
    link: "/help/faq",
  },
  {
    title: "Contact Support",
    description: "Reach out to our support team for personalized assistance.",
    icon: <MessageSquare size={24} />,
    color: "orange",
    link: routes.contact,
  },
];

export default function HelpPage() {
  return (
    <main>
      {/* Hero Section */}
      <Box py={80} style={{ backgroundColor: "#f8f9fa" }}>
        <Container size="lg">
          <Stack gap="xl" align="center">
            <div style={{ textAlign: "center" }}>
              <Title order={1} size="h1" fw={900} mb="md">
                Help Center
              </Title>
              <Text size="lg" c="dimmed" maw={600} mx="auto">
                Find the help you need to make the most of your tutoring experience.
              </Text>
            </div>
          </Stack>
        </Container>
      </Box>

      {/* Help Sections */}
      <Box py={60}>
        <Container size="lg">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={50}>
            {helpSections.map((section) => (
              <Paper key={section.title} radius="md" p="xl" withBorder>
                <Stack gap="md">
                  <ThemeIcon size={50} radius="md" color={section.color}>
                    {section.icon}
                  </ThemeIcon>
                  <div>
                    <Title order={3} size="h4" mb="xs">
                      {section.title}
                    </Title>
                    <Text size="sm" c="dimmed" mb="md">
                      {section.description}
                    </Text>
                    <Button
                      component={Link}
                      href={section.link}
                      variant="light"
                      rightSection={<ArrowRight size={16} />}
                      radius="md"
                    >
                      Learn More
                    </Button>
                  </div>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Quick Support */}
      <Box py={80} style={{ backgroundColor: "#f8f9fa" }}>
        <Container size="lg">
          <Paper radius="md" p={40} withBorder>
            <Stack gap="xl" align="center">
              <div style={{ textAlign: "center" }}>
                <Title order={2} mb="md">
                  Need Immediate Assistance?
                </Title>
                <Text size="lg" c="dimmed" maw={600} mx="auto">
                  Our support team is available Monday through Friday, 8:00 AM to 5:00 PM PST.
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