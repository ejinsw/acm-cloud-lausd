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
  PinInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { routes } from "../../routes";

type Step = "email" | "verify" | "reset";

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
        value.length === 6 ? null : "Verification code must be 6 digits",
      newPassword: (value) =>
        value.length < 8
          ? "Password must be at least 8 characters long"
          : null,
      confirmPassword: (value, values) =>
        value !== values.newPassword ? "Passwords do not match" : null,
    },
  });

  const handleEmailSubmit = async (values: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      // TODO: Implement actual email verification logic here
      setEmail(values.email);
      
      // Show notification
      notifications.show({
        id: 'verification-sent',
        title: "Verification Code Sent",
        message: "Please check your email for the verification code.",
        color: "green",
        icon: <CheckCircle2 size={16} />,
        autoClose: 5000,
        withCloseButton: true,
      });

      // Change step immediately
      setCurrentStep("verify");
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

  const handleVerificationSubmit = async (values: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      // TODO: Implement actual verification code check here
      console.log("Verifying code:", values.verificationCode);
      
      // Store the verification code in form state for the next step
      form.setFieldValue("verificationCode", values.verificationCode);
      
      // Show notification
      notifications.show({
        id: 'code-verified',
        title: "Code Verified",
        message: "Please set your new password.",
        color: "green",
        icon: <CheckCircle2 size={16} />,
        autoClose: 5000,
        withCloseButton: true,
      });

      // Change step immediately
      setCurrentStep("reset");
    } catch (error) {
      console.error("Error verifying code:", error);
      notifications.show({
        id: 'verification-error',
        title: "Error",
        message: "Invalid verification code. Please try again.",
        color: "red",
        icon: <XCircle size={16} />,
        autoClose: 5000,
        withCloseButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (values: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      // TODO: Implement actual password reset logic here
      console.log("Resetting password for:", email);
      console.log("New password:", values.newPassword);
      
      // Show notification
      notifications.show({
        id: 'password-reset-success',
        title: "Password Reset Successful",
        message: "You can now sign in with your new password.",
        color: "green",
        icon: <CheckCircle2 size={16} />,
        autoClose: 5000,
        withCloseButton: true,
      });

      // Redirect after a short delay
      setTimeout(() => {
        router.push(routes.signIn);
      }, 1000);
    } catch (error) {
      console.error("Error resetting password:", error);
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
    switch (currentStep) {
      case "email":
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
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(form.values.email)) {
                    form.setFieldError('email', 'Please enter a valid email address');
                    return;
                  }
                  handleEmailSubmit(form.values);
                }
              }}
            >
              Send Verification Code
            </Button>
          </Stack>
        );
      case "verify":
        return (
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              We sent a verification code to {email}
            </Text>
            <PinInput
              length={6}
              size="lg"
              radius="md"
              value={form.values.verificationCode}
              onChange={(value) => form.setFieldValue('verificationCode', value)}
            />
            <Button
              size="lg"
              loading={loading}
              radius="md"
              mt="md"
              fullWidth
              onClick={() => {
                if (form.values.verificationCode) {
                  handleVerificationSubmit(form.values);
                }
              }}
            >
              Verify Code
            </Button>
          </Stack>
        );
      case "reset":
        return (
          <Stack gap="md">
            <PasswordInput
              label="New Password"
              placeholder="Enter your new password"
              required
              value={form.values.newPassword}
              onChange={(event) => form.setFieldValue('newPassword', event.currentTarget.value)}
              autoComplete="new-password"
            />
            <PasswordInput
              label="Confirm New Password"
              placeholder="Confirm your new password"
              required
              value={form.values.confirmPassword}
              onChange={(event) => form.setFieldValue('confirmPassword', event.currentTarget.value)}
              autoComplete="new-password"
            />
            <Button
              size="lg"
              loading={loading}
              radius="md"
              mt="md"
              fullWidth
              onClick={() => {
                if (form.values.newPassword && form.values.confirmPassword) {
                  handlePasswordReset(form.values);
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
                  {currentStep === "verify" && "Verify Your Email"}
                  {currentStep === "reset" && "Reset Your Password"}
                </Title>
                <Text size="lg" c="dimmed">
                  {currentStep === "email" && "Enter your email to receive a verification code"}
                  {currentStep === "verify" && "Enter the 6-digit code sent to your email"}
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
