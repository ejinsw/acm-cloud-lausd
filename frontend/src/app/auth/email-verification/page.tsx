"use client";

import { useState, useEffect } from "react";
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
import { useSearchParams } from "next/navigation";

export default function EmailVerificationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setEmail(searchParams.get("email") || localStorage.getItem("pendingVerificationEmail"));
  }, [searchParams]);

  const form = useForm({
    initialValues: {
      email: email || "",
      code: "",
    },
    validate: {
      email: (value) => {
        if (!email && !value) return "Email is required";
        if (value && !/^\S+@\S+$/.test(value)) return "Invalid email format";
        return null;
      },
      code: (value) => (value.length === 6 ? null : "Code must be 6 digits"),
    },
  });

  const handleSubmit = async (values: { email: string; code: string }) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          code: values.code, 
          email: values.email || email 
        }),
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

      localStorage.removeItem("pendingVerificationEmail");
      router.push(routes.signIn);
    } catch {
      notifications.show({
        title: "Error",
        message: "Invalid email or invalid verification code.",
        color: "red",
        icon: <XCircle size={16} />,
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const emailToUse = email || form.values.email;
    
    if (!emailToUse) {
      notifications.show({
        title: "Email Required",
        message: "Please provide the same email address you used during registration to resend the verification code.",
        color: "red",
        icon: <XCircle size={16} />,
        autoClose: 5000,
      });
      return;
    }

    // Validate email format if provided through form
    if (!email && form.values.email && !/^\S+@\S+$/.test(form.values.email)) {
      notifications.show({
        title: "Invalid Email",
        message: "Please enter a valid email address.",
        color: "red",
        icon: <XCircle size={16} />,
        autoClose: 5000,
      });
      return;
    }

    setResending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse }),
      });
      if (!response.ok) throw new Error("Failed to resend code");
      notifications.show({
        title: "Verification Code Resent",
        message: "A new verification code has been sent to your email.",
        color: "green",
        icon: <CheckCircle2 size={16} />,
        autoClose: 5000,
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to resend verification code.",
        color: "red",
        icon: <XCircle size={16} />,
        autoClose: 5000,
      });
    } finally {
      setResending(false);
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
                  {isClient && !email && (
                    <TextInput
                      label="Email Address"
                      placeholder="Enter your email address"
                      required
                      {...form.getInputProps("email")}
                    />
                  )}
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
                  <Button
                    variant="outline"
                    size="sm"
                    loading={resending}
                    radius="md"
                    mt="sm"
                    fullWidth
                    onClick={handleResend}
                    disabled={resending}
                  >
                    Resend Code
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
