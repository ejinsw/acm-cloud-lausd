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
      content: "support@lausdtutoring.org",
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
      content: "333 South Beaudry Avenue, Los Angeles, CA 90017",
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
            </div>
          </Stack>
        </Container>
      </Box>

      {/* Contact Information */}
      <Box py={60}>
        <Container size="lg">
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={30}>
            {contactInfo.map((info) => (
              <Paper key={info.title} p="md" radius="md" withBorder>
                <Stack gap="md">
                  <ThemeIcon size={50} radius="md" color={info.color}>
                    {info.icon}
                  </ThemeIcon>
                  <div>
                    <Text fw={500} size="lg" mb={5}>
                      {info.title}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {info.content}
                    </Text>
                  </div>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Contact Form */}
      <Box py={80} style={{ backgroundColor: "#f8f9fa" }}>
        <Container size="lg">
          <Grid gutter={60}>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper radius="md" p={40} withBorder>
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
                    <Button 
                      type="submit" 
                      size="lg" 
                      rightSection={<Send size={16} />}
                      radius="md"
                    >
                      Send Message
                    </Button>
                  </Stack>
                </form>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xl">
                <div>
                  <Title order={2} mb="md">
                    Get in Touch
                  </Title>
                  <Text size="lg" c="dimmed">
                    We&apos;re here to help with any questions you might have about our tutoring services.
                    Fill out the form and we&apos;ll get back to you as soon as possible.
                  </Text>
                </div>
                <Paper radius="md" p={40} withBorder>
                  <Stack gap="xl">
                    <div>
                      <Title order={3} size="h4" mb="md">
                        Frequently Asked Questions
                      </Title>
                      <Text c="dimmed">
                        Check our FAQ section for quick answers to common questions about our tutoring services.
                      </Text>
                    </div>
                    <Button 
                      variant="outline" 
                      rightSection={<MessageSquare size={16} />}
                      radius="md"
                    >
                      View FAQ
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>
    </main>
  );
} 