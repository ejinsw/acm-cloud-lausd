"use client";

import {
  Group,
  ActionIcon,
  Text,
  Divider,
  Container,
  Stack,
  SimpleGrid,
  Title,
  Anchor,
  Box
} from "@mantine/core";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { routes } from "../../app/routes";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box>
      <Divider />
      
      <Container size="xl" py="md">
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" mb="md">
          <Stack gap="xs">
            <Title order={5}>LAUSD Tutoring</Title>
            <Text size="xs" c="dimmed">
              Empowering students through personalized learning experiences.
            </Text>
            
            <Group mt="xs">
              <ActionIcon size="sm" variant="subtle">
                <Facebook size={16} />
              </ActionIcon>
              <ActionIcon size="sm" variant="subtle">
                <Instagram size={16} />
              </ActionIcon>
              <ActionIcon size="sm" variant="subtle">
                <Twitter size={16} />
              </ActionIcon>
              <ActionIcon size="sm" variant="subtle">
                <Youtube size={16} />
              </ActionIcon>
            </Group>
          </Stack>
          
          <Group align="flex-start" grow>
            <Stack gap="xs">
              <Title order={6}>Resources</Title>
              <Anchor component={Link} href={routes.help} underline="never" size="xs">Help Center</Anchor>
              <Anchor component={Link} href={routes.contact} underline="never" size="xs">Contact Us</Anchor>
              <Anchor component={Link} href={`${routes.help}/faq`} underline="never" size="xs">FAQs</Anchor>
            </Stack>
            
            <Stack gap="xs">
              <Title order={6}>Company</Title>
              <Anchor component={Link} href={routes.terms} underline="never" size="xs">Terms of Service</Anchor>
              <Anchor component={Link} href={routes.privacy} underline="never" size="xs">Privacy Policy</Anchor>
            </Stack>
          </Group>
        </SimpleGrid>
        
        <Divider my="xs" />
        
        <Group justify="space-between" py="xs">
          <Text size="xs" c="dimmed">
            © {currentYear} Los Angeles Unified School District
          </Text>
          <Group gap="xs" wrap="nowrap">
            <Anchor component={Link} href={routes.terms} underline="hover" size="xs">
              Terms
            </Anchor>
            <Text size="xs" c="dimmed">•</Text>
            <Anchor component={Link} href={routes.privacy} underline="hover" size="xs">
              Privacy
            </Anchor>
          </Group>
        </Group>
      </Container>
    </Box>
  );
} 