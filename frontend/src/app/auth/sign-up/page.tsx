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
  Image,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { IconUpload, IconX, IconPhoto } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { routes } from "../../routes";
//import AllSchoolsDropdown from "./component/SchoolListDropdown";

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: "student" | "instructor";
  grade?: string;
  subjects?: string[];
  schoolName: string;
  agreeToTerms: boolean;
  birthdate: Date | null;
  instructorId?: FileWithPath | null;
  parentEmail?: string;
}

const gradeLevels = [
  { value: "7", label: "7th Grade" },
  { value: "8", label: "8th Grade" },
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
      schoolName: "",
      agreeToTerms: false,
      birthdate: null,
      instructorId: null,
      parentEmail: "",
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
      schoolName: (value) =>
        !value ? "Please select your school" : null,
      grade: (value, values) =>
        values.role === "student" && !value ? "Please select your grade" : null,
      subjects: (value, values) =>
        values.role === "student" && (!value || value.length === 0)
          ? "Please select at least one subject"
          : null,
      agreeToTerms: (value) =>
        !value ? "You must agree to the terms and conditions" : null,
      birthdate: (value) =>
        !value ? "Please select your birthdate" : null,
      instructorId: (value, values) =>
        values.role === "instructor" && !value ? "Please upload your school ID" : null,
      parentEmail: (value, values) =>
        values.role === "student" && (!value || !/^\S+@\S+$/.test(value))
          ? "Please enter a valid parent email address"
          : null,
    },
  });

  const handleSubmit = async (values: SignUpFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create account');
      }

      notifications.show({
        title: "Success!",
        message: "Your account has been created successfully. Now verify",
        color: "green",
        icon: <CheckCircle2 size={16} />,
        autoClose: 5000,
      });

      // Store email for verification step
      localStorage.setItem("pendingVerificationEmail", values.email);

      // Redirect to the email verification page
      router.push(routes.emailVerification);
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

                  <DatePickerInput
                    label="Birthdate"
                    placeholder="Select your birthdate"
                    required
                    minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 100))}
                    maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 13))}
                    {...form.getInputProps("birthdate")}
                  />

                  <TextInput
                    label="Email"
                    placeholder="Enter your email"
                    required
                    {...form.getInputProps("email")}
                  />

                  <div>
                    {/* <Text size="sm" fw={500} mb={5}>School</Text> */}
                    {/* <AllSchoolsDropdown onChange={(value) => form.setFieldValue('schoolName', value)} /> */}
                    <TextInput
                      label="School Name"
                      placeholder="Enter the school you go to"
                      required
                      {...form.getInputProps("schoolName")}
                    />
                  </div>

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

                      <TextInput
                        label="Parent/Guardian Email"
                        placeholder="Enter parent/guardian email address"
                        required
                        description="Information on meetings and sessions will be sent to this email as well"
                        {...form.getInputProps("parentEmail")}
                      />
                    </>
                  )}

                  {form.values.role === "instructor" && (
                    <Stack>
                      <Text size="sm" fw={500}>School ID Upload</Text>
                      <Text size="xs" c="dimmed" mb={5}>Upload your school-issued ID (max 5MB)</Text>
                      <Dropzone
                        onDrop={(files) => form.setFieldValue("instructorId", files[0])}
                        maxFiles={1}
                        accept={["image/jpeg", "image/png", "image/jpg"]}
                        maxSize={5 * 1024 ** 2}
                      >
                        <Group justify="center" gap="xl" style={{ minHeight: 100, pointerEvents: "none" }}>
                          <Dropzone.Accept>
                            <IconUpload size={32} stroke={1.5} />
                          </Dropzone.Accept>
                          <Dropzone.Reject>
                            <IconX size={32} stroke={1.5} />
                          </Dropzone.Reject>
                          <Dropzone.Idle>
                            {form.values.instructorId ? (
                              <Image
                                src={URL.createObjectURL(form.values.instructorId)}
                                alt="School ID preview"
                                w={150}
                                h={150}
                                fit="contain"
                                radius="md"
                              />
                            ) : (
                              <IconPhoto size={32} stroke={1.5} />
                            )}
                          </Dropzone.Idle>

                          <div>
                            <Text size="xl" inline>
                              {form.values.instructorId ? "File uploaded successfully" : "Drag your school ID here or click to select"}
                            </Text>
                            <Text size="sm" c="dimmed" inline mt={7}>
                              {form.values.instructorId ? "Click or drag to replace" : "File should not exceed 5MB"}
                            </Text>
                          </div>
                        </Group>
                      </Dropzone>
                    </Stack>
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