"use client";

import { Container, Group, Text, ActionIcon, Divider, Stack, Anchor } from '@mantine/core';
import { Phone, Facebook, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <Container size="xl">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="md:w-4/12">
            <Text fw={700} size="lg" className="mb-4">LAUSD Tutoring Program</Text>
            <Text size="sm" className="text-gray-400 mb-6">
              A service of the Los Angeles Unified School District providing high-quality tutoring to students across all grade levels.
            </Text>
            <Group gap="xs">
              <ActionIcon variant="subtle" color="gray" size="lg" radius="xl">
                <Phone size={20} className="text-gray-400" />
              </ActionIcon>
              <ActionIcon variant="subtle" color="gray" size="lg" radius="xl">
                <Facebook size={20} className="text-gray-400" />
              </ActionIcon>
              <ActionIcon variant="subtle" color="gray" size="lg" radius="xl">
                <Instagram size={20} className="text-gray-400" />
              </ActionIcon>
              <ActionIcon variant="subtle" color="gray" size="lg" radius="xl">
                <Youtube size={20} className="text-gray-400" />
              </ActionIcon>
            </Group>
          </div>

          <div>
            <Text fw={600} size="md" className="mb-3">Resources</Text>
            <Stack gap="xs" className="text-gray-400">
              <Anchor href="#" className="text-inherit no-underline hover:text-blue-300">Student Resources</Anchor>
              <Anchor href="#" className="text-inherit no-underline hover:text-blue-300">Parent Portal</Anchor>
              <Anchor href="#" className="text-inherit no-underline hover:text-blue-300">Tutor Application</Anchor>
              <Anchor href="#" className="text-inherit no-underline hover:text-blue-300">Tutoring FAQ</Anchor>
            </Stack>
          </div>

          <div>
            <Text fw={600} size="md" className="mb-3">Programs</Text>
            <Stack gap="xs" className="text-gray-400">
              <Anchor href="#" className="text-inherit no-underline hover:text-blue-300">Elementary Tutoring</Anchor>
              <Anchor href="#" className="text-inherit no-underline hover:text-blue-300">Middle School Support</Anchor>
              <Anchor href="#" className="text-inherit no-underline hover:text-blue-300">High School Programs</Anchor>
              <Anchor href="#" className="text-inherit no-underline hover:text-blue-300">Test Preparation</Anchor>
            </Stack>
          </div>

          <div>
            <Text fw={600} size="md" className="mb-3">Information</Text>
            <Stack gap="xs" className="text-gray-400">
              <Anchor href="#" className="text-inherit no-underline hover:text-blue-300">About LAUSD</Anchor>
              <Anchor href="#" className="text-inherit no-underline hover:text-blue-300">Privacy Policy</Anchor>
              <Anchor href="#" className="text-inherit no-underline hover:text-blue-300">Terms of Service</Anchor>
              <Anchor href="#" className="text-inherit no-underline hover:text-blue-300">Contact Us</Anchor>
            </Stack>
          </div>
        </div>

        <Divider my="xl" color="gray.7" />

        <div className="text-center text-gray-500 text-sm">
          <Text>&copy; {new Date().getFullYear()} Los Angeles Unified School District. All rights reserved.</Text>
          <Text mt="xs">
            333 South Beaudry Avenue, Los Angeles, CA 90017 | (213) 241-1000
          </Text>
        </div>
      </Container>
    </footer>
  );
} 