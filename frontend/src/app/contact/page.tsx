"use client";

import {
  Container,
  Title,
  Text,
  TextInput,
  Textarea,
  Button,
  Box,
  Paper,
  Stack,
  Grid,
  ThemeIcon,
  SimpleGrid,
  Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { routes } from "../routes";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const form = useForm<ContactFormData>({
    initialValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
    validate: {
      name: (value) => (value.length < 2 ? "Name must be at least 2 characters" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      subject: (value) => (value.length < 5 ? "Subject must be at least 5 characters" : null),
      message: (value) => (value.length < 20 ? "Message must be at least 20 characters" : null),
    },
  });

  const handleSubmit = (values: ContactFormData) => {
    console.log(values);
    // TODO: Implement form submission
  };

  const contactInfo = [
    {
      icon: <Mail size={24} />,
      title: "Email",
      content: "support@tutoringapp.org",
      color: "blue",
    },
    {
      icon: <Phone size={24} />,
      title: "Phone",
      content: "(213) 241-1000",
      color: "green",
    },
    {
      icon: <MapPin size={24} />,
      title: "Address",
      content: "Remote support team (US-based)",
      color: "red",
    },
    {
      icon: <Clock size={24} />,
      title: "Hours",
      content: "Monday - Friday: 8:00 AM - 5:00 PM",
      color: "violet",
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <Box py={80} style={{ backgroundColor: "#f8f9fa" }}>
        <Container size="lg">
          <Stack gap="xl" align="center">
            <div style={{ textAlign: "center" }}>
              <Title order={1} size="h1" fw={900} mb="md">
                Contact Us
              </Title>
              <Text size="lg" c="dimmed" maw={600} mx="auto">
                Have questions? We&apos;re here to help. Reach out to our team and we&apos;ll get back to you as soon as possible.
              </Text>
              <Badge mt="md" color="blue" variant="light">
                Typical response time: under 24 hours
              </Badge>
            </div>
          </Stack>
        </Container>
      </Box>

      {/* Contact Form */}
      <Box py={80} style={{ backgroundColor: "#f8f9fa" }}>
        <Container size="lg">
          <Grid gutter={60}>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="lg">
                <div>
                  <Title order={2} mb="md">
                    Support Channels
                  </Title>
                  <Text size="lg" c="dimmed">
                    Choose your preferred way to reach our team.
                  </Text>
                </div>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={16}>
                  {contactInfo.map((info) => (
                    <Paper key={info.title} p="md" radius="md" withBorder>
                      <Stack gap="sm">
                        <ThemeIcon size={44} radius="md" color={info.color}>
                          {info.icon}
                        </ThemeIcon>
                        <Text fw={600}>{info.title}</Text>
                        <Text size="sm" c="dimmed">
                          {info.content}
                        </Text>
                      </Stack>
                    </Paper>
                  ))}
                </SimpleGrid>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper radius="md" p={40} withBorder className="app-glass">
                <Stack gap="md">
                  <Title order={3}>Send a Message</Title>
                  <Text size="sm" c="dimmed">
                    We usually reply within one business day.
                  </Text>
                  <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                      <TextInput
                        label="Name"
                        placeholder="Your name"
                        required
                        {...form.getInputProps("name")}
                      />
                      <TextInput
                        label="Email"
                        placeholder="your@email.com"
                        required
                        {...form.getInputProps("email")}
                      />
                      <TextInput
                        label="Subject"
                        placeholder="What is this regarding?"
                        required
                        {...form.getInputProps("subject")}
                      />
                      <Textarea
                        label="Message"
                        placeholder="Your message"
                        required
                        minRows={5}
                        {...form.getInputProps("message")}
                      />
                      <Button type="submit" size="lg" rightSection={<Send size={16} />} radius="md">
                        Send Message
                      </Button>
                    </Stack>
                  </form>
                  <Button component={Link} href={`${routes.help}/faq`} variant="subtle" rightSection={<MessageSquare size={16} />}>
                    Browse FAQs
                  </Button>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>
    </main>
  );
} 
