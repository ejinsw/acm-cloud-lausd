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
  Badge,
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
      confirmPassword: (value, values) =>
        currentStep === "reset" && value !== values?.newPassword ? "Passwords do not match" : null,
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

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Failed to send code");
      }
      notifications.show({
        id: "resend-success",
        title: "Code sent",
        message: "A new verification code was sent to your email.",
        color: "green",
        icon: <CheckCircle2 size={16} />,
        autoClose: 5000,
        withCloseButton: true,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to resend code.";
      notifications.show({
        id: "resend-error",
        title: "Error",
        message: msg,
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
      const payload = {
        email,
        code: (form.values.verificationCode ?? "").trim(),
        newPassword: form.values.newPassword ?? "",
      };
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      const errorMessage = typeof data?.error === "string" ? data.error : null;

      if (!response.ok) {
        throw new Error(errorMessage || "Failed to reset password");
      }

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
      
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reset password. Please try again.";
      notifications.show({
        id: 'password-reset-error',
        title: "Error",
        message,
        color: "red",
        icon: <XCircle size={16} />,
        autoClose: 7000,
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
              const validation = form.validate();
              const { verificationCode, newPassword, confirmPassword } = form.values;
              if (
                !validation.hasErrors &&
                verificationCode &&
                newPassword &&
                confirmPassword &&
                newPassword === confirmPassword
              ) {
                handleResetSubmit();
              }
            }}
          >
            Reset Password
          </Button>
          <Button
            variant="light"
            size="sm"
            fullWidth
            loading={loading}
            onClick={handleResendCode}
          >
            Resend verification code
          </Button>
        </Stack>
      );
    }
  };

  return (
    <main>
      <Box
        py={90}
        style={{
          background:
            "radial-gradient(circle at 10% 20%, rgba(39,116,174,0.2), transparent 28%), radial-gradient(circle at 90% 0%, rgba(255,209,0,0.2), transparent 24%), #f4f8fc",
        }}
      >
        <Container size="sm">
          <Paper radius="md" p={40} withBorder className="app-glass">
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
                <Badge mt="sm" color="blue" variant="light">
                  {currentStep === "email" ? "Step 1 of 2" : "Step 2 of 2"}
                </Badge>
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
