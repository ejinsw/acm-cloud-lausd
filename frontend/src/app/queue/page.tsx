"use client";

import { useAuth } from "../../components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, Text, Button, Group } from "@mantine/core";
import { IconUsers, IconUserCheck } from "@tabler/icons-react";

export default function QueuePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    // Redirect based on user role
    if (user.role === "STUDENT") {
      router.push("/queue/join");
    } else if (user.role === "INSTRUCTOR") {
      router.push("/queue/instructor");
    } else {
      // Admin or other roles - show options
      return;
    }
  }, [user, router]);

  if (!user) {
    return (
      <Box p="xl">
        <Text>Loading...</Text>
      </Box>
    );
  }

  // Show options for admin or if no specific role
  return (
    <Box p="xl">
      <Text size="xl" fw={700} mb="xl">
        Queue Management
      </Text>

      <Group>
        <Button
          leftSection={<IconUsers size={16} />}
          onClick={() => router.push("/queue/join")}
          size="lg"
        >
          Join Queue (Student)
        </Button>

        <Button
          leftSection={<IconUserCheck size={16} />}
          onClick={() => router.push("/queue/instructor")}
          size="lg"
          variant="outline"
        >
          Manage Queue (Instructor)
        </Button>
      </Group>
    </Box>
  );
}
