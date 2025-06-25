"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Title,
  Text,
  Box,
  Paper,
  Stack,
  TextInput,
  Button,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { CheckCircle2, XCircle } from "lucide-react";
import { routes } from "../../routes";

export default function EmailVerificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const email = localStorage.getItem("pendingVerificationEmail");

  const form = useForm({
    initialValues: {
      code: "",
    },
    validate: {
      code: value => (value.length === 6 ? null : "Code must be 6 digits"),
    },
  });

  const handleSubmit = async (values: { code: string }) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, code: values.code }),
      });

      if (!response.ok) {
        throw new Error("Verification failed");
      }

      notifications.show({
        title: "Success!",
        message: "Your email has been verified. Please log in.",
        color: "green",
        icon: <CheckCircle2 size={16} />,
        autoClose: 5000,
      });

      router.push(routes.signIn);
    } catch {
      notifications.show({
        title: "Error",
        message: "Invalid or expired verification code.",
        color: "red",
        icon: <XCircle size={16} />,
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <Box py={80} style={{ backgroundColor: "#f8f9fa" }}>
        <Container size="sm">
          <Paper radius="md" p={40} withBorder>
            <Stack gap="xl">
              <div style={{ textAlign: "center" }}>
                <Title order={1} size="h1" fw={900} mb="md">
                  Email Verification
                </Title>
                <Text size="lg" c="dimmed">
                  Enter the 6-digit code sent to your email
                </Text>
              </div>

              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                  <TextInput
                    label="Verification Code"
                    placeholder="Enter your code"
                    required
                    maxLength={6}
                    {...form.getInputProps("code")}
                  />
                  <Button
                    type="submit"
                    size="lg"
                    loading={loading}
                    radius="md"
                    mt="md"
                    fullWidth
                  >
                    Verify Email
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </main>
  );
}
