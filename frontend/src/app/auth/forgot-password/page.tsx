"use client";

import {
  Container,
  Title,
  Text,
  Box,
  Paper,
  Stack,
  TextInput,
  PasswordInput,
  Button,
  Group,
  Anchor,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { routes } from "../../routes";

type Step = "email" | "reset";

interface ForgotPasswordFormData {
  email: string;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");

  const form = useForm<ForgotPasswordFormData>({
    initialValues: {
      email: "",
      verificationCode: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      verificationCode: (value) =>
        currentStep === "reset" && value.length !== 6 ? "Verification code must be 6 digits" : null,
      newPassword: (value) =>
        currentStep === "reset" && value.length < 8 ? "Password must be at least 8 characters long" : null,
    },
  });

  const handleEmailSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.values.email }),
      });

      if (!response.ok) throw new Error("Failed to send verification code");
      
      setEmail(form.values.email);
      
      notifications.show({
        id: 'verification-sent',
        title: "Verification Code Sent",
        message: "Please check your email for the verification code.",
        color: "green",
        icon: <CheckCircle2 size={16} />,
        autoClose: 5000,
        withCloseButton: true,
      });
      setCurrentStep("reset");
    } catch {
      notifications.show({
        id: 'verification-error',
        title: "Error",
        message: "Failed to send verification code. Please try again.",
        color: "red",
        icon: <XCircle size={16} />,
        autoClose: 5000,
        withCloseButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          code: form.values.verificationCode,
          newPassword: form.values.newPassword,
        }),
      });

      if (!response.ok) throw new Error("Failed to reset password");
      
      notifications.show({
        id: 'password-reset-success',
        title: "Password Reset Successful",
        message: "You can now sign in with your new password.",
        color: "green",
        icon: <CheckCircle2 size={16} />,
        autoClose: 5000,
        withCloseButton: true,
      });

      setTimeout(() => {
        router.push(routes.signIn);
      }, 1000);
      
    } catch {
      notifications.show({
        id: 'password-reset-error',
        title: "Error",
        message: "Failed to reset password. Please try again.",
        color: "red",
        icon: <XCircle size={16} />,
        autoClose: 5000,
        withCloseButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    if (currentStep === "email") {
      return (
        <Stack gap="md">
          <TextInput
            label="Email"
            placeholder="Enter your email"
            required
            value={form.values.email}
            onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
            error={form.errors.email}
            autoComplete="email"
            type="email"
          />
          <Button
            size="lg"
            loading={loading}
            radius="md"
            mt="md"
            fullWidth
            onClick={() => {
              if (form.values.email) {
                handleEmailSubmit();
              }
            }}
          >
            Send Verification Code
          </Button>
        </Stack>
      );
    }
    if (currentStep === "reset") {
      return (
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            We sent a verification code to {email}
          </Text>
          <TextInput
            label="Verification Code"
            placeholder="Enter the 6-digit code"
            required
            value={form.values.verificationCode}
            onChange={(event) => form.setFieldValue('verificationCode', event.currentTarget.value)}
            error={form.errors.verificationCode}
            maxLength={6}
          />
          <PasswordInput
            label="New Password"
            placeholder="Enter your new password"
            required
            value={form.values.newPassword}
            onChange={(event) => form.setFieldValue('newPassword', event.currentTarget.value)}
            error={form.errors.newPassword}
            autoComplete="new-password"
          />
          <PasswordInput
            label="Confirm New Password"
            placeholder="Confirm your new password"
            required
            value={form.values.confirmPassword}
            onChange={(event) => form.setFieldValue('confirmPassword', event.currentTarget.value)}
            error={form.errors.confirmPassword}
            autoComplete="new-password"
          />
          <Button
            size="lg"
            loading={loading}
            radius="md"
            mt="md"
            fullWidth
            onClick={() => {
              if (
                !form.errors.verificationCode &&
                !form.errors.newPassword &&
                !form.errors.confirmPassword &&
                form.values.verificationCode &&
                form.values.newPassword &&
                form.values.confirmPassword
              ) {
                handleResetSubmit();
              }
            }}
          >
            Reset Password
          </Button>
        </Stack>
      );
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
                  {currentStep === "email" && "Forgot Password"}
                  {currentStep === "reset" && "Reset Your Password"}
                </Title>
                <Text size="lg" c="dimmed">
                  {currentStep === "email" && "Enter your email to receive a verification code"}
                  {currentStep === "reset" && "Create a new password for your account"}
                </Text>
              </div>

              {renderStep()}

              <Group justify="center">
                <Text size="sm" c="dimmed">
                  Remember your password?{" "}
                  <Anchor component={Link} href={routes.signIn} fw={700}>
                    Sign in
                  </Anchor>
                </Text>
              </Group>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </main>
  );
}
