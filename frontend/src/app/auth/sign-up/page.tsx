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
  MultiSelect,
  Loader,
  Badge,
  Alert,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { IconUpload, IconX, IconPhoto } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { routes } from "../../routes";
import { useSettings } from "@/hooks/useSettings";

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
  credentialedSubjects?: string[];
  // Address fields
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const gradeLevels = [
  { value: "7", label: "7th Grade" },
  { value: "8", label: "8th Grade" },
  { value: "9", label: "9th Grade" },
  { value: "10", label: "10th Grade" },
  { value: "11", label: "11th Grade" },
  { value: "12", label: "12th Grade" },
];

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [useCustomSchool, setUseCustomSchool] = useState(false);
  const {
    settings,
    isLoading: settingsLoading,
    error: settingsError,
    refetch,
  } = useSettings();

  const subjectOptions = (settings?.subjects || []).map((subject) => ({
    value: subject,
    label: subject,
  }));
  const schoolOptions = [
    ...(settings?.schools || []).map((school) => ({
      value: school,
      label: school,
    })),
    {
      value: "__custom__",
      label: "Other (enter manually)",
    },
  ];
  const settingsNotInitialized = !settingsLoading && !settings;
  const settingsUnavailableMessage =
    settingsError ||
    (settingsNotInitialized
      ? "Platform settings are not initialized yet. Ask an admin to initialize settings."
      : null);

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
      credentialedSubjects: [],
      // Address fields
      street: "",
      apartment: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => {
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters long";
        if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
        if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter";
        if (!/\d/.test(value)) return "Password must contain at least one number";
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) return "Password must contain at least one symbol (!@#$%^&*...)";
        return null;
      },
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
      credentialedSubjects: (value, values) =>
        values.role === "instructor" && (!value || value.length === 0)
          ? "Please select at least one subject you are credentialed to teach"
          : null,
      agreeToTerms: (value) =>
        !value ? "You must agree to the terms and conditions" : null,
      birthdate: (value) =>
        !value ? "Please select your birthdate" : null,
      instructorId: () =>
        null, // Photo ID is optional
      parentEmail: (value, values) =>
        values.role === "student" && (!value || !/^\S+@\S+$/.test(value))
          ? "Please enter a valid parent email address"
          : null,
      // Address validation
      street: (value) => (!value ? "Street address is required" : null),
      city: (value) => (!value ? "City is required" : null),
      state: (value) => (!value ? "State is required" : null),
      zip: (value) => (!value ? "ZIP code is required" : null),
      country: (value) => (!value ? "Country is required" : null),
    },
  });

  const selectedSchoolValue = useCustomSchool
    ? "__custom__"
    : form.values.schoolName || null;

  const handleSubmit = async (values: SignUpFormData) => {
    setLoading(true);
    try {
      // Debug logging to see what we're getting
      console.log("Form values:", values);
      console.log("Credentialed subjects:", values.credentialedSubjects);
      console.log("Student subjects:", values.subjects);
      
      // Prepare the data to send to the backend
      const submitData = {
        ...values,
        // For instructors, use credentialedSubjects as subjects
        // For students, use subjects as is
        subjects: values.role === "instructor" ? values.credentialedSubjects : values.subjects,
        // Remove the credentialedSubjects field as backend expects 'subjects'
        credentialedSubjects: undefined,
      };

      console.log("Submit data:", submitData);
      console.log("Subjects being sent:", submitData.subjects);

      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create account');
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
    } catch (error: unknown) {
      console.error('Signup error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create account. Please try again.";
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
        icon: <XCircle size={16} />,
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching settings
  if (settingsLoading) {
    return (
      <main>
        <Box py={80} style={{ backgroundColor: "#f8f9fa" }}>
          <Container size="sm">
            <Paper radius="md" p={40} withBorder>
              <Stack gap="xl" align="center">
                <Loader size="lg" />
                <Text>Loading platform settings...</Text>
              </Stack>
            </Paper>
          </Container>
        </Box>
      </main>
    );
  }

  return (
    <main>
      <Box
        py={90}
        style={{
          background:
            "radial-gradient(circle at 10% 20%, rgba(39,116,174,0.18), transparent 28%), radial-gradient(circle at 90% 0%, rgba(255,209,0,0.2), transparent 25%), #f4f8fc",
        }}
      >
        <Container size="sm">
          <Paper radius="md" p={40} withBorder className="app-glass">
            <Stack gap="xl">
              <div style={{ textAlign: "center" }}>
                <Title order={1} size="h1" fw={900} mb="md">
                  Create Your Account
                </Title>
                <Text size="lg" c="dimmed">
                  Join our tutoring platform and start your learning journey
                </Text>
                <Badge mt="sm" color="blue" variant="light">
                  Step 1 of 2: Account Setup
                </Badge>
              </div>

              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                  {settingsUnavailableMessage && (
                    <Alert color="red" title="Settings unavailable">
                      <Stack gap="xs">
                        <Text size="sm">{settingsUnavailableMessage}</Text>
                        <Button
                          variant="light"
                          size="xs"
                          onClick={() => void refetch()}
                          w="fit-content"
                        >
                          Retry
                        </Button>
                      </Stack>
                    </Alert>
                  )}

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

                  <Stack gap={4}>
                    <Text size="sm" fw={500}>
                      Birthdate
                    </Text>
                    <Stack gap={4}>
                      <Text size="sm" fw={500}>
                        Select your birthdate
                      </Text>
                      <DatePicker
                        minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 100))}
                        maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 13))}
                        {...form.getInputProps("birthdate")}
                      />
                    </Stack>
                  </Stack>

                  <TextInput
                    label="Email"
                    placeholder="Enter your email"
                    required
                    {...form.getInputProps("email")}
                  />

                  <div>
                    <Select
                      label="School Name"
                      placeholder="Select your school"
                      data={schoolOptions}
                      value={selectedSchoolValue}
                      searchable
                      required
                      onChange={(value) => {
                        if (!value) {
                          setUseCustomSchool(false);
                          form.setFieldValue("schoolName", "");
                          return;
                        }

                        if (value === "__custom__") {
                          setUseCustomSchool(true);
                          form.setFieldValue("schoolName", "");
                          return;
                        }

                        setUseCustomSchool(false);
                        form.setFieldValue("schoolName", value);
                      }}
                    />
                    {useCustomSchool && (
                      <TextInput
                        mt="sm"
                        label="Custom School Name"
                        placeholder="Enter your school name"
                        required
                        {...form.getInputProps("schoolName")}
                      />
                    )}
                  </div>

                  {/* Address Section */}
                  <Text size="lg" fw={500} mt="md">Address Information</Text>
                  <TextInput
                    label="Street Address"
                    placeholder="Enter your street address"
                    required
                    {...form.getInputProps("street")}
                  />
                  <TextInput
                    label="Apartment/Suite"
                    placeholder="Apartment, suite, etc. (optional)"
                    {...form.getInputProps("apartment")}
                  />
                  <Group grow>
                    <TextInput
                      label="City"
                      placeholder="Enter your city"
                      required
                      {...form.getInputProps("city")}
                    />
                    <TextInput
                      label="State"
                      placeholder="Enter your state"
                      required
                      {...form.getInputProps("state")}
                    />
                  </Group>
                  <Group grow>
                    <TextInput
                      label="ZIP Code"
                      placeholder="Enter your ZIP code"
                      required
                      {...form.getInputProps("zip")}
                    />
                    <TextInput
                      label="Country"
                      placeholder="Enter your country"
                      required
                      {...form.getInputProps("country")}
                    />
                  </Group>
                  
                  {form.values.password && (
                    <Box>
                      <Text size="sm" fw={500} mb={8}>Password Requirements:</Text>
                      <Stack gap={4}>
                        <Text size="xs" c={form.values.password.length >= 8 ? "green" : "red"}>
                          ✓ At least 8 characters long
                        </Text>
                        <Text size="xs" c={/[A-Z]/.test(form.values.password) ? "green" : "red"}>
                          ✓ Contains uppercase letter
                        </Text>
                        <Text size="xs" c={/[a-z]/.test(form.values.password) ? "green" : "red"}>
                          ✓ Contains lowercase letter
                        </Text>
                        <Text size="xs" c={/\d/.test(form.values.password) ? "green" : "red"}>
                          ✓ Contains number
                        </Text>
                        <Text size="xs" c={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.values.password) ? "green" : "red"}>
                          ✓ Contains symbol (!@#$%^&*...)
                        </Text>
                      </Stack>
                    </Box>
                  )}

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

                      <MultiSelect
                        label="Subjects"
                        placeholder="Select subjects you need help with"
                        data={subjectOptions}
                        required
                        searchable
                        disabled={settingsNotInitialized}
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
                      <MultiSelect
                        label="Credentialed Subjects"
                        placeholder="Select subjects you are credentialed to teach"
                        data={subjectOptions}
                        required
                        description="Select all subjects you are qualified and credentialed to teach"
                        searchable
                        disabled={settingsNotInitialized}
                        {...form.getInputProps("credentialedSubjects")}
                      />

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
