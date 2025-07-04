/**
 * LOGIN PAGE
 *
 * Requires:
 * - Login Form
 *   - Username Field
 *   - Password Field
 *   - Remember Me Checkbox
 *   - Instructor Checkbox
 *   - Submit Button
 *   - Register Page Link "/register"
 * 
 * Additional Notes:
 * - Other than the conditional, is no need for us to edit the onSubmit asynchronous 
 *   function in the ContactForm. This will be handled later on by the school.
 * - The Next.js official documentation might be helpful https://nextjs.org/docs/app/api-reference/components/form
 *
 */

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
  Divider,
  Checkbox,
  Anchor,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { routes } from "../../routes";

interface SignInFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<SignInFormData>({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length < 8
          ? "Password must be at least 8 characters long"
          : null,
    },
  });

  const handleSubmit = async (values: SignInFormData) => {
    setLoading(true);
    try {
      // Call the Next.js API route for sign-in
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to sign in. Incorrect username or password');
      }

      // Store the token based on remember me preference



      // if (values.rememberMe) {
      //   localStorage.setItem("authToken", authToken);
      // } else {
      //   sessionStorage.setItem("authToken", authToken);
      // }

      notifications.show({
        title: "Success!",
        message: "You have been signed in successfully.",
        color: "green",
        icon: <CheckCircle2 size={16} />,
        autoClose: 5000,
      });

      // Redirect to the appropriate dashboard by getting the role
      router.push(routes.studentDashboard);
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to sign in. Please check your credentials.",
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
                  Welcome Back
                </Title>
                <Text size="lg" c="dimmed">
                  Sign in to your account to continue
                </Text>
              </div>

              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                  <TextInput
                    label="Email"
                    placeholder="Enter your email"
                    required
                    {...form.getInputProps("email")}
                  />

                  <PasswordInput
                    label="Password"
                    placeholder="Enter your password"
                    required
                    {...form.getInputProps("password")}
                  />

                  <Group justify="space-between">
                    <Checkbox
                      label="Remember me"
                      {...form.getInputProps("rememberMe", { type: "checkbox" })}
                    />
                    <Anchor component={Link} href={routes.forgotPassword} size="sm">
                      Forgot password?
                    </Anchor>
                  </Group>

                  <Button
                    type="submit"
                    size="lg"
                    loading={loading}
                    radius="md"
                    mt="md"
                  >
                    Sign In
                  </Button>
                </Stack>
              </form>

              <Divider label="or" labelPosition="center" />

              <Group justify="center">
                <Text size="sm" c="dimmed">
                  Don&apos;t have an account?{" "}
                  <Anchor component={Link} href={routes.signUp} fw={700}>
                    Sign up
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
