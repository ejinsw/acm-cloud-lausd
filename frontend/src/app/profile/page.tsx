"use client";

import { Suspense } from "react";
import { Container, Title, Text, Box, Paper, Stack, Tabs } from "@mantine/core";
import { useSearchParams } from "next/navigation";
import { AccountSettings, StudentFormData, InstructorFormData } from "@/components/account/AccountSettings";
import { notifications } from "@mantine/notifications";
import { CheckCircle2 } from "lucide-react";

function ProfileContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  const handleSaveSettings = (data: StudentFormData | InstructorFormData) => {
    console.log("Saving settings:", data);
    notifications.show({
      title: "Success!",
      message: "Your settings have been saved successfully.",
      color: "green",
      icon: <CheckCircle2 size={16} />,
      autoClose: 5000,
    });
  };

  return (
    <Box py={80} style={{ backgroundColor: "#f8f9fa" }}>
      <Container size="lg">
        <Stack gap="xl">
          <div style={{ textAlign: "center" }}>
            <Title order={1} size="h1" fw={900} mb="md">
              Profile & Settings
            </Title>
            <Text size="lg" c="dimmed">
              Manage your account settings and preferences
            </Text>
          </div>

          <Paper radius="md" p="xl" withBorder>
            <Tabs value={activeTab}>
              <Tabs.List>
                <Tabs.Tab value="profile">Profile</Tabs.Tab>
                <Tabs.Tab value="settings">Settings</Tabs.Tab>
                <Tabs.Tab value="progress">Progress</Tabs.Tab>
                <Tabs.Tab value="analytics">Analytics</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="profile">
                <Box py="xl">
                  <AccountSettings 
                    userRole="student"
                    onSave={handleSaveSettings}
                  />
                </Box>
              </Tabs.Panel>

              <Tabs.Panel value="settings">
                <Box py="xl">
                  <AccountSettings 
                    userRole="student"
                    onSave={handleSaveSettings}
                  />
                </Box>
              </Tabs.Panel>

              <Tabs.Panel value="progress">
                <Box py="xl">
                  <Text>Progress tracking and statistics will be displayed here.</Text>
                </Box>
              </Tabs.Panel>

              <Tabs.Panel value="analytics">
                <Box py="xl">
                  <Text>Analytics and insights will be displayed here.</Text>
                </Box>
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
} 