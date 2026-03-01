"use client";

import { Container, Title, Text, Box, Paper, Stack, List, Anchor } from "@mantine/core";

export default function DocumentationPage() {
  return (
    <main>
      <Box py={80} style={{ backgroundColor: "#f8f9fa" }}>
        <Container size="lg">
          <Stack gap="xl" align="center">
            <div style={{ textAlign: "center" }}>
              <Title order={1} size="h1" fw={900} mb="md">
                Documentation
              </Title>
              <Text size="lg" c="dimmed" maw={600} mx="auto">
                How to use the tutoring platform and link your Zoom account for sessions.
              </Text>
            </div>
          </Stack>
        </Container>
      </Box>

      <Box py={60}>
        <Container size="md">
          <Stack gap="xl">
            <Paper radius="md" p="xl" withBorder>
              <Title order={2} size="h4" mb="md">
                1. Overview
              </Title>
              <Text size="sm" c="dimmed">
                Our platform connects students with instructors for one-on-one or group tutoring.
                Instructors can link their Zoom account to create video meetings automatically when
                they schedule sessions. Students receive meeting links to join at the scheduled time.
              </Text>
            </Paper>

            <Paper radius="md" p="xl" withBorder>
              <Title order={2} size="h4" mb="md">
                2. Linking Your Zoom Account (Instructors)
              </Title>
              <Text size="sm" c="dimmed" mb="md">
                To use Zoom for your tutoring sessions:
              </Text>
              <List size="sm" spacing="xs" mb="md">
                <List.Item>Sign in and go to your Profile or Dashboard.</List.Item>
                <List.Item>Find the &quot;Connect Zoom&quot; or &quot;Link Zoom Account&quot; section.</List.Item>
                <List.Item>Click the button and authorize the app in the Zoom consent screen.</List.Item>
                <List.Item>Once connected, new sessions you create can include a Zoom meeting link.</List.Item>
              </List>
              <Text size="sm" c="dimmed">
                You can disconnect Zoom at any time from the same profile section. Disconnecting
                does not delete past meetings but will prevent new meetings from being created
                through the platform.
              </Text>
            </Paper>

            <Paper radius="md" p="xl" withBorder>
              <Title order={2} size="h4" mb="md">
                3. Creating a Session with Zoom
              </Title>
              <Text size="sm" c="dimmed" mb="md">
                After your Zoom account is linked:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Create a new session from the Sessions or Dashboard area.</List.Item>
                <List.Item>Fill in the session details (name, time, subject, etc.).</List.Item>
                <List.Item>When you save or publish the session, a Zoom meeting is created automatically.</List.Item>
                <List.Item>The meeting link appears on the session page for you and enrolled students.</List.Item>
              </List>
            </Paper>

            <Paper radius="md" p="xl" withBorder>
              <Title order={2} size="h4" mb="md">
                4. Joining a Session (Students)
              </Title>
              <Text size="sm" c="dimmed">
                As a student, when you join or are accepted into a session, the session page will
                show a &quot;Join Meeting&quot; or meeting link when the session time arrives. Click the link
                to open Zoom in your browser or Zoom app. Ensure you have a working camera and
                microphone for the best experience.
              </Text>
            </Paper>

            <Paper radius="md" p="xl" withBorder>
              <Title order={2} size="h4" mb="md">
                5. Permissions and Data
              </Title>
              <Text size="sm" c="dimmed">
                Our Zoom integration requests the minimum permissions needed to create and manage
                meetings on your behalf (e.g., create meetings, read meeting details). We do not
                access your Zoom recordings or other Zoom account data beyond what is required for
                the integration. For more details, see our <Anchor href="/policy">Privacy Policy</Anchor>.
              </Text>
            </Paper>

            <Paper radius="md" p="xl" withBorder>
              <Title order={2} size="h4" mb="md">
                6. Troubleshooting
              </Title>
              <List size="sm" spacing="xs">
                <List.Item>
                  <strong>Meeting link not showing:</strong> Ensure your Zoom account is still
                  linked in your profile and that the session was created after linking.
                </List.Item>
                <List.Item>
                  <strong>Can&apos;t connect Zoom:</strong> Clear cookies for this site and try again, or
                  ensure you are signing in with the Zoom account you intend to use.
                </List.Item>
                <List.Item>
                  <strong>Zoom errors during use:</strong> Check Zoom&apos;s status page or try
                  rejoining. For account or billing issues, contact Zoom support.
                </List.Item>
              </List>
            </Paper>

            <Paper radius="md" p="xl" withBorder>
              <Title order={2} size="h4" mb="md">
                7. Additional Resources
              </Title>
              <Text size="sm" c="dimmed" mb="md">
                For platform help: <Anchor href="/help">Help Center</Anchor> ·{" "}
                <Anchor href="/support">Support</Anchor>
              </Text>
              <Text size="sm" c="dimmed">
                For Zoom-specific help: Zoom Help Center (support.zoom.us) and Zoom&apos;s documentation
                for meetings and webinars.
              </Text>
            </Paper>
          </Stack>
        </Container>
      </Box>
    </main>
  );
}
