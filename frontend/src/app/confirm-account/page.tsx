"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  Group,
  Alert,
  PinInput,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import Link from "next/link";
import PageWrapper from "@/components/PageWrapper";

function ConfirmAccountContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [codeError, setCodeError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCodeError("");

    // Validate code length
    if (code.length !== 6) {
      setCodeError("Please enter the complete 6-digit verification code");
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch("/api/auth/verify-email", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, code }),
      // });
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to success page
      router.push(`/confirm-account?token=${code}&email=${encodeURIComponent(email)}`);
    } catch {
      setError("Failed to verify your account. Please check your email and code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Stack gap="xl">
          <div>
            <Title order={2} ta="center" mb="md">
              Verify Your Account
            </Title>
            <Text c="dimmed" ta="center" mb="xl">
              Enter your email address and the verification code sent to your email.
            </Text>
          </div>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                size="md"
              />

              <div>
                <Text size="sm" fw={500} mb={8}>
                  Verification Code <Text span c="red">*</Text>
                </Text>
                <Group justify="center">
                  <PinInput
                    length={6}
                    value={code}
                    onChange={(value) => {
                      setCode(value);
                      if (value.length === 6) {
                        setCodeError("");
                      }
                    }}
                    type="number"
                    size="lg"
                    radius="md"
                    error={!!codeError}
                  />
                </Group>
                {codeError && (
                  <Text size="xs" c="red" mt={4}>
                    {codeError}
                  </Text>
                )}
              </div>

              {error && (
                <Alert color="red" icon={<IconAlertCircle size={16} />}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                loading={loading}
                fullWidth
                size="md"
                mt="md"
              >
                Verify Account
              </Button>
            </Stack>
          </form>

          <Group justify="space-between" mt="md">
            <Text size="sm" c="dimmed">
              Didn&apos;t receive a code?
            </Text>
            <Button
              component={Link}
              href="/resend-verification"
              variant="subtle"
              size="sm"
            >
              Resend Code
            </Button>
          </Group>

          <Group justify="center">
            <Button
              component={Link}
              href="/"
              variant="light"
              size="sm"
            >
              Return to Home
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}

export default function ConfirmAccountPage() {
  return (
    <PageWrapper>
      <ConfirmAccountContent />
    </PageWrapper>
  );
} 