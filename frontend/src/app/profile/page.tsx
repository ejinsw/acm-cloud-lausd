"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Container,
  Title,
  Paper,
  Tabs,
  Text,
  Group,
  Box,
  Avatar,
  Stack,
  TextInput,
  Button,
  Select,
  Grid,
  PasswordInput,
  FileButton,
  Loader,
  Center,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { User, Lock, Bell, Shield } from "lucide-react";

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get initial tab from URL or default to "profile"
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState<string | null>(initialTab);
  const [photo, setPhoto] = useState<File | null>(null);

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", activeTab);
      router.push(`?${params.toString()}`);
    }
  }, [activeTab, router, searchParams]);

  // Mock user data - in a real app, this would come from an API
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Student",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    grade: "10th Grade",
    school: "LAUSD High School",
  };

  // Mock notification settings
  const notificationSettings = {
    emailNotifications: true,
    sessionReminders: true,
    achievementAlerts: true,
    marketingEmails: false,
  };

  return (
    <Container size="xl" py="xl">
      <Paper p="xl" radius="md" withBorder mb="xl">
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={2}>Profile & Settings</Title>
            <Text c="dimmed">Manage your account settings and preferences</Text>
          </div>
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
          <Tabs.List>
            <Tabs.Tab value="profile" leftSection={<User size={16} />}>
              Profile
            </Tabs.Tab>
            <Tabs.Tab value="security" leftSection={<Lock size={16} />}>
              Security
            </Tabs.Tab>
            <Tabs.Tab value="notifications" leftSection={<Bell size={16} />}>
              Notifications
            </Tabs.Tab>
            <Tabs.Tab value="privacy" leftSection={<Shield size={16} />}>
              Privacy
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="profile">
            <Box pt="md">
              <Grid>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Stack align="center" gap="md">
                    <Avatar 
                      src={photo ? URL.createObjectURL(photo) : user.avatar} 
                      size={120} 
                      radius={120} 
                    />
                    <FileButton onChange={setPhoto} accept="image/*">
                      {(props) => (
                        <Button variant="light" size="sm" {...props}>
                          Change Photo
                        </Button>
                      )}
                    </FileButton>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <Stack>
                    <TextInput
                      label="Full Name"
                      placeholder="Your name"
                      defaultValue={user.name}
                    />
                    <TextInput
                      label="Email"
                      placeholder="Your email"
                      defaultValue={user.email}
                      disabled
                    />
                    <Select
                      label="Grade Level"
                      placeholder="Select your grade"
                      defaultValue={user.grade}
                      data={[
                        "9th Grade",
                        "10th Grade",
                        "11th Grade",
                        "12th Grade",
                      ]}
                    />
                    <TextInput
                      label="School"
                      placeholder="Your school"
                      defaultValue={user.school}
                    />
                    <Group justify="flex-end">
                      <Button>Save Changes</Button>
                    </Group>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="security">
            <Box pt="md">
              <Stack>
                <PasswordInput
                  label="Current Password"
                  placeholder="Enter your current password"
                />
                <PasswordInput
                  label="New Password"
                  placeholder="Enter your new password"
                />
                <PasswordInput
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                />
                <Group justify="flex-end">
                  <Button>Update Password</Button>
                </Group>
              </Stack>
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="notifications">
            <Box pt="md">
              <Stack>
                <Text size="sm" c="dimmed" mb="md">
                  Choose which notifications you want to receive
                </Text>
                <Group>
                  <Button
                    variant={
                      notificationSettings.emailNotifications
                        ? "filled"
                        : "light"
                    }
                    onClick={() => {
                      notifications.show({
                        title: "Settings Updated",
                        message:
                          "Your notification preferences have been saved",
                        color: "green",
                      });
                    }}
                  >
                    Email Notifications
                  </Button>
                  <Button
                    variant={
                      notificationSettings.sessionReminders ? "filled" : "light"
                    }
                    onClick={() => {
                      notifications.show({
                        title: "Settings Updated",
                        message:
                          "Your notification preferences have been saved",
                        color: "green",
                      });
                    }}
                  >
                    Session Reminders
                  </Button>
                  <Button
                    variant={
                      notificationSettings.achievementAlerts
                        ? "filled"
                        : "light"
                    }
                    onClick={() => {
                      notifications.show({
                        title: "Settings Updated",
                        message:
                          "Your notification preferences have been saved",
                        color: "green",
                      });
                    }}
                  >
                    Achievement Alerts
                  </Button>
                </Group>
              </Stack>
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="privacy">
            <Box pt="md">
              <Stack>
                <Text size="sm" c="dimmed" mb="md">
                  Manage your privacy settings and data
                </Text>
                <Group>
                  <Button
                    variant="light"
                    color="red"
                    onClick={() => {
                      notifications.show({
                        title: "Account Deletion",
                        message:
                          "Are you sure you want to delete your account? This action cannot be undone.",
                        color: "red",
                      });
                    }}
                  >
                    Delete Account
                  </Button>
                  <Button
                    variant="light"
                    onClick={() => {
                      notifications.show({
                        title: "Data Export",
                        message:
                          "Your data export has been initiated. You will receive an email when it's ready.",
                        color: "blue",
                      });
                    }}
                  >
                    Export Data
                  </Button>
                </Group>
              </Stack>
            </Box>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <Center h={400}>
          <Loader size="lg" />
        </Center>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
