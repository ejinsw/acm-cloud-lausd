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
import PageWrapper from "@/components/PageWrapper";

function SignInContent() {
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
    <Container size="sm" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} mb="lg" ta="center">
          Welcome back!
        </Title>

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="your@email.com"
              required
              value={formValues.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              value={formValues.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />

            <Button type="submit" fullWidth mt="xl">
              Sign in
            </Button>
          </Stack>
        </form>

        <Divider my="lg" label="Or continue with" labelPosition="center" />

        <Group grow mb="md" mt="md">
          <Button variant="default">Google</Button>
          <Button variant="default">Microsoft</Button>
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

export default function SignInPage() {
  return (
    <PageWrapper>
      <SignInContent />
    </PageWrapper>
  );
} 