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
import { useState } from "react";
import { routes } from "../../routes";

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

export default function SignUpPage() {
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
        value.length < 8
          ? "Password must be at least 8 characters long"
          : null,
      confirmPassword: (value, values) =>
        value !== values.password ? "Passwords do not match" : null,
      firstName: (value) =>
        value.length < 2 ? "First name must be at least 2 characters" : null,
      lastName: (value) =>
        value.length < 2 ? "Last name must be at least 2 characters" : null,
      grade: (value, values) =>
        values.role === "student" && !value ? "Please select your grade" : null,
      subjects: (value, values) =>
        values.role === "student" && (!value || value.length === 0)
          ? "Please select at least one subject"
          : null,
      agreeToTerms: (value) =>
        !value ? "You must agree to the terms and conditions" : null,
    },
  });

  const handleSubmit = async (values: SignUpFormData) => {
    setLoading(true);
    try {
      // TODO: Implement actual sign-up logic here
      console.log("Form submitted:", values);
      
      notifications.show({
        title: "Success!",
        message: "Your account has been created successfully.",
        color: "green",
        icon: <CheckCircle2 size={16} />,
        autoClose: 5000,
      });

      // Redirect to the appropriate dashboard based on role
      router.push(values.role === "student" ? routes.studentDashboard : routes.instructorDashboard);
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to create account. Please try again.",
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
                  Create Your Account
                </Title>
                <Text size="lg" c="dimmed">
                  Join our tutoring platform and start your learning journey
                </Text>
              </div>

              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                  <Radio.Group
                    label="I am a"
                    description="Select your role on the platform"
                    {...form.getInputProps("role")}
                  >
                    <Group mt="xs">
                      <Radio value="student" label="Student" />
                      <Radio value="instructor" label="Instructor" />
                    </Group>
                  </Radio.Group>

                  <Group grow>
                    <TextInput
                      label="First Name"
                      placeholder="Enter your first name"
                      required
                      {...form.getInputProps("firstName")}
                    />
                    <TextInput
                      label="Last Name"
                      placeholder="Enter your last name"
                      required
                      {...form.getInputProps("lastName")}
                    />
                  </Group>

                  <TextInput
                    label="Email"
                    placeholder="Enter your email"
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

                  <Button
                    type="submit"
                    size="lg"
                    loading={loading}
                    radius="md"
                    mt="md"
                  >
                    Create Account
                  </Button>
                </Stack>
              </form>

              <Divider label="or" labelPosition="center" />

              <Group justify="center">
                <Text size="sm" c="dimmed">
                  Already have an account?{" "}
                  <Anchor component={Link} href={routes.signIn}>
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