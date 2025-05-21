"use client";

import { useState } from "react";
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  TextInput,
  PasswordInput,
  Button,
  Group,
  Select,
  Radio,
  Checkbox,
  Anchor,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { routes } from "../../routes";
import PageWrapper from "@/components/PageWrapper";

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: "student" | "instructor";
  grade?: string;
  subjects?: string[];
  agreeToTerms: boolean;
}

const gradeLevels = [
  { value: "9", label: "9th Grade" },
  { value: "10", label: "10th Grade" },
  { value: "11", label: "11th Grade" },
  { value: "12", label: "12th Grade" },
];

const subjects = [
  { value: "math", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "english", label: "English" },
  { value: "history", label: "History" },
  { value: "computer_science", label: "Computer Science" },
];

function SignUpContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<SignUpFormData>({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      role: "student",
      grade: "",
      subjects: [],
      agreeToTerms: false,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length < 8 ? "Password must be at least 8 characters" : null,
      confirmPassword: (value, values) =>
        value !== values.password ? "Passwords did not match" : null,
      firstName: (value) =>
        value.length < 2 ? "First name must be at least 2 characters" : null,
      lastName: (value) =>
        value.length < 2 ? "Last name must be at least 2 characters" : null,
      agreeToTerms: (value) =>
        !value ? "You must agree to the terms and conditions" : null,
    },
  });

  const handleSubmit = async (values: SignUpFormData) => {
    setLoading(true);
    try {
      // TODO: Implement actual sign-up logic here
      console.log("Sign up attempt:", values);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      notifications.show({
        title: "Success!",
        message: "Your account has been created successfully.",
        color: "green",
        icon: <CheckCircle2 size={16} />,
      });
      
      // Redirect to sign in page
      router.push(routes.signIn);
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to create account. Please try again.",
        color: "red",
        icon: <XCircle size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} mb="lg" ta="center">
          Create an account
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <Group grow>
              <TextInput
                label="First name"
                placeholder="Your first name"
                required
                {...form.getInputProps("firstName")}
              />
              <TextInput
                label="Last name"
                placeholder="Your last name"
                required
                {...form.getInputProps("lastName")}
              />
            </Group>

            <TextInput
              label="Email"
              placeholder="your@email.com"
              required
              {...form.getInputProps("email")}
            />

            <PasswordInput
              label="Password"
              placeholder="Create a password"
              required
              {...form.getInputProps("password")}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              required
              {...form.getInputProps("confirmPassword")}
            />

            <Radio.Group
              label="I am a"
              required
              {...form.getInputProps("role")}
            >
              <Group mt="xs">
                <Radio value="student" label="Student" />
                <Radio value="instructor" label="Instructor" />
              </Group>
            </Radio.Group>

            {form.values.role === "student" && (
              <>
                <Select
                  label="Grade Level"
                  placeholder="Select your grade"
                  data={gradeLevels}
                  required
                  {...form.getInputProps("grade")}
                />

                <Select
                  label="Subjects"
                  placeholder="Select subjects you need help with"
                  data={subjects}
                  multiple
                  required
                  {...form.getInputProps("subjects")}
                />
              </>
            )}

            <Checkbox
              label={
                <>
                  I agree to the{" "}
                  <Anchor component={Link} href={routes.terms}>
                    Terms of Service
                  </Anchor>{" "}
                  and{" "}
                  <Anchor component={Link} href={routes.privacy}>
                    Privacy Policy
                  </Anchor>
                </>
              }
              {...form.getInputProps("agreeToTerms", { type: "checkbox" })}
            />

            <Button type="submit" fullWidth mt="xl" loading={loading}>
              Create account
            </Button>
          </Stack>
        </form>

        <Text ta="center" mt="md">
          Already have an account?{" "}
          <Anchor component={Link} href={routes.signIn} fw={700}>
            Sign in
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
}

export default function SignUpPage() {
  return (
    <PageWrapper>
      <SignUpContent />
    </PageWrapper>
  );
} 