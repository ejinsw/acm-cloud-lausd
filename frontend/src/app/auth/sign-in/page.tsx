"use client";

import { useState } from "react";
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Anchor,
  Stack,
  Divider,
  Group,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { routes } from "@/app/routes";

export default function SignInPage() {
  const router = useRouter();
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormValues({
      ...formValues,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual sign-in logic here
    console.log("Sign in attempt:", formValues);
    
    // For now, just redirect to dashboard
    router.push("/instructor/dashboard");
  };

  return (
    <Container size="xs" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} ta="center" mt="md" mb={50}>
          Welcome back!
        </Title>

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Email address"
              placeholder="hello@example.com"
              size="md"
              required
              value={formValues.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              size="md"
              required
              value={formValues.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />

            <Anchor
              component={Link}
              href="/forgot-password"
              size="sm"
              ta="right"
            >
              Forgot password?
            </Anchor>

            <Button type="submit" size="md" fullWidth mt="xl">
              Sign in
            </Button>
          </Stack>
        </form>

        <Divider label="Or continue with" labelPosition="center" my="lg" />

        <Group grow mb="md" mt="md">
          <Button variant="default" radius="xl">
            Google
          </Button>
          <Button variant="default" radius="xl">
            Microsoft
          </Button>
        </Group>

        <Text ta="center" mt="md">
          Don&apos;t have an account?{" "}
          <Anchor component={Link} href={routes.signUp} fw={700}>
            Register
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
} 