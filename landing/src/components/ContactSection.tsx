"use client";

import { 
  Container, 
  Title, 
  Text, 
  SimpleGrid, 
  TextInput, 
  Textarea, 
  Button, 
  Group, 
  Card,
  ThemeIcon
} from '@mantine/core';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export function ContactSection() {
  return (
    <section id="contact" className="py-16 md:py-20 bg-gray-50">
      <Container size="xl">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={50}>
          <div>
            <Title className="text-gray-900 mb-4">Contact Us</Title>
            <Text size="lg" c="dimmed" mb="xl">
              Have questions about our tutoring programs? Our team is here to help you find the right support for your student.
            </Text>

            <form>
              <TextInput
                label="Name"
                placeholder="Your name"
                required
                classNames={{
                  root: 'mb-4',
                }}
              />
              <TextInput
                label="Email"
                placeholder="youremail@example.com"
                required
                classNames={{
                  root: 'mb-4',
                }}
              />
              <TextInput
                label="Phone"
                placeholder="(XXX) XXX-XXXX"
                classNames={{
                  root: 'mb-4',
                }}
              />
              <TextInput
                label="Student's Grade"
                placeholder="e.g., 7th grade"
                classNames={{
                  root: 'mb-4',
                }}
              />
              <Textarea
                label="Message"
                placeholder="How can we help you?"
                minRows={4}
                required
                classNames={{
                  root: 'mb-4',
                }}
              />

              <Group justify="flex-end" mt="md">
                <Button type="submit" color="blue">Send Message</Button>
              </Group>
            </form>
          </div>

          <div>
            <Card withBorder p="xl" radius="md" className="mb-4">
              <Group gap="sm">
                <ThemeIcon
                  size={40}
                  radius="md"
                  color="blue"
                  className="flex items-center justify-center"
                >
                  <MapPin size={24} />
                </ThemeIcon>
                <div>
                  <Text fw={700} size="lg" className="mb-0">Visit Us</Text>
                  <Text size="sm">
                    Los Angeles Unified School District<br />
                    333 South Beaudry Avenue<br />
                    Los Angeles, CA 90017
                  </Text>
                </div>
              </Group>
            </Card>

            <Card withBorder p="xl" radius="md" className="mb-4">
              <Group gap="sm">
                <ThemeIcon
                  size={40}
                  radius="md"
                  color="blue"
                  className="flex items-center justify-center"
                >
                  <Phone size={24} />
                </ThemeIcon>
                <div>
                  <Text fw={700} size="lg" className="mb-0">Call Us</Text>
                  <Text size="sm">
                    Main Office: (213) 241-1000<br />
                    Tutoring Program: (213) 241-1200
                  </Text>
                </div>
              </Group>
            </Card>

            <Card withBorder p="xl" radius="md" className="mb-4">
              <Group gap="sm">
                <ThemeIcon
                  size={40}
                  radius="md"
                  color="blue"
                  className="flex items-center justify-center"
                >
                  <Mail size={24} />
                </ThemeIcon>
                <div>
                  <Text fw={700} size="lg" className="mb-0">Email Us</Text>
                  <Text size="sm">
                    General Inquiries: info@lausd.edu<br />
                    Tutoring Program: tutoring@lausd.edu<br />
                  </Text>
                </div>
              </Group>
            </Card>

            <Card withBorder p="xl" radius="md">
              <Group gap="sm">
                <ThemeIcon
                  size={40}
                  radius="md"
                  color="blue"
                  className="flex items-center justify-center"
                >
                  <Clock size={24} />
                </ThemeIcon>
                <div>
                  <Text fw={700} size="lg" className="mb-0">Tutoring Hours</Text>
                  <Text size="sm">
                    Monday - Friday: 3:00 PM - 7:00 PM<br />
                    Saturday: 9:00 AM - 1:00 PM<br />
                    Sunday: Closed
                  </Text>
                </div>
              </Group>
            </Card>
          </div>
        </SimpleGrid>
      </Container>
    </section>
  );
} 