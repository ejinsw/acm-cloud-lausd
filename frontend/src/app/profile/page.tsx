"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Container,
  Title,
  Paper,
  Tabs,
  Text,
  Group,
  Box,
  Avatar,
  Stack,
  TextInput,
  Button,
  Select,
  Grid,
  FileButton,
  Modal,
  Textarea,
  LoadingOverlay,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { User, Shield, CheckCircle2, XCircle } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { routes } from "../routes";
import { getToken } from "@/actions/authentication";

interface UserProfile {
  id: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR';
  firstName: string;
  lastName: string;
  birthdate?: string;
  street?: string;
  apartment?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  schoolName?: string;
  profilePicture?: string;
  bio?: string;
  grade?: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
  parentPhone?: string;
  interests?: string;
  learningGoals?: string;
  education?: string;
  experience?: string;
  certificationUrls?: string;
  subjects?: Array<{ id: string; name: string }>;
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);

  // Get initial tab from URL or default to "profile"
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState<string | null>(initialTab);
  const [photo, setPhoto] = useState<File | null>(null);

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", activeTab);
      router.push(`?${params.toString()}`);
    }
  }, [activeTab, router, searchParams]);

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      // Get the access token using the getToken function
      const accessToken = await getToken();
      if (!accessToken) {
        notifications.show({
          title: "Authentication Required",
          message: "Please log in to view your profile",
          color: "red",
          icon: <XCircle size={16} />,
        });
        router.push(routes.signIn);
        return;
      }
      console.log('Fetching profile with token:', accessToken.substring(0, 20) + '...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Profile response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Profile fetch error:', errorData);
        throw new Error(errorData.message || `Failed to fetch profile (${response.status})`);
      }

      const data = await response.json();
      console.log('Profile data received:', data);
      console.log('User grade from backend:', data.user?.grade);
      console.log('User address from backend:', {
        street: data.user?.street,
        apartment: data.user?.apartment,
        city: data.user?.city,
        state: data.user?.state,
        zip: data.user?.zip,
        country: data.user?.country
      });
      setUser(data.user);
    } catch (error: unknown) {
      console.error('Profile fetch error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load profile data";
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
        icon: <XCircle size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get the access token
      const accessToken = await getToken();
      if (!accessToken) {
        notifications.show({
          title: "Authentication Required",
          message: "Please log in to update your profile",
          color: "red",
          icon: <XCircle size={16} />,
        });
        router.push(routes.signIn);
        return;
      }

      const updateData = {
        // Common fields for both roles
        street: user.street,
        ...(user.apartment && { apartment: user.apartment }), // Only include if apartment has a value
        city: user.city,
        state: user.state,
        zip: user.zip,
        country: user.country,
        ...(user.bio && { bio: user.bio }), // Only include if bio has a value
        ...(user.role === 'STUDENT' && {
          // Student-specific fields only
          grade: user.grade,
          parentEmail: user.parentEmail,
        }),
        ...(user.role === 'INSTRUCTOR' && {
          // Instructor-specific fields only
          firstName: user.firstName,
          lastName: user.lastName,
          education: user.education,
          experience: user.experience,
          certificationUrls: user.certificationUrls,
          subjects: user.subjects?.map(s => s.name) || [],
        }),
      };

      console.log('Sending update data:', updateData);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Update profile error response:', errorData);
        console.error('Response status:', response.status);
        throw new Error(errorData.message || errorData.error || `Failed to update profile (${response.status})`);
      }

      notifications.show({
        title: "Success!",
        message: "Your profile has been updated successfully",
        color: "green",
        icon: <CheckCircle2 size={16} />,
        autoClose: 3000,
      });

      // Redirect to dashboard after successful update
      setTimeout(() => {
        router.push(user.role === 'INSTRUCTOR' ? routes.instructorDashboard : routes.studentDashboard);
      }, 2000);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
        icon: <XCircle size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      
      // Get the access token
      const accessToken = await getToken();
      if (!accessToken) {
        notifications.show({
          title: "Authentication Required",
          message: "Please log in to delete your account",
          color: "red",
          icon: <XCircle size={16} />,
        });
        router.push(routes.signIn);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/users/profile`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      notifications.show({
        title: "Account Deleted",
        message: "Your account has been successfully deleted",
        color: "green",
        icon: <CheckCircle2 size={16} />,
        autoClose: 3000,
      });

      // Clear local storage and redirect to home
      localStorage.clear();
      sessionStorage.clear();
      setTimeout(() => {
        router.push(routes.home);
      }, 2000);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete account";
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
        icon: <XCircle size={16} />,
      });
    } finally {
      setLoading(false);
      closeDeleteModal();
    }
  };

  // Helper function to normalize grade value
  const normalizeGrade = (grade: string | undefined): string => {
    if (!grade) return '';
    
    // Handle different possible formats from backend
    const gradeLower = grade.toLowerCase();
    if (gradeLower.includes('7') || gradeLower.includes('seventh')) return '7th Grade';
    if (gradeLower.includes('8') || gradeLower.includes('eighth')) return '8th Grade';
    if (gradeLower.includes('9') || gradeLower.includes('ninth')) return '9th Grade';
    if (gradeLower.includes('10') || gradeLower.includes('tenth')) return '10th Grade';
    if (gradeLower.includes('11') || gradeLower.includes('eleventh')) return '11th Grade';
    if (gradeLower.includes('12') || gradeLower.includes('twelfth')) return '12th Grade';
    
    return grade; // Return as-is if no match
  };

  if (!user) {
    return (
      <Container size="xl" py="xl">
        <LoadingOverlay visible={loading} />
        <Paper p="xl" radius="md" withBorder>
          <Text ta="center">Loading profile...</Text>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <LoadingOverlay visible={loading} />
      <Paper p="xl" radius="md" withBorder mb="xl">
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={2}>Profile & Settings</Title>
            <Text c="dimmed">Manage your account settings and preferences</Text>
          </div>
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
          <Tabs.List>
            <Tabs.Tab value="profile" leftSection={<User size={16} />}>
              Profile
            </Tabs.Tab>
            {user.role === 'STUDENT' && (
              <Tabs.Tab value="parent" leftSection={<User size={16} />}>
                Parent Info
              </Tabs.Tab>
            )}
            <Tabs.Tab value="address" leftSection={<User size={16} />}>
              Address
            </Tabs.Tab>

            <Tabs.Tab value="privacy" leftSection={<Shield size={16} />}>
              Privacy
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="profile">
            <Box pt="md">
              <Grid>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Stack align="center" gap="md">
                    <Avatar 
                      src={photo ? URL.createObjectURL(photo) : user.profilePicture || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`} 
                      size={120} 
                      radius={120} 
                    />
                    <FileButton onChange={setPhoto} accept="image/*">
                      {(props) => (
                        <Button variant="light" size="sm" {...props}>
                          Change Photo
                        </Button>
                      )}
                    </FileButton>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <Stack>
                    {/* Read-only Personal Information */}
                    <Text size="lg" fw={500} mb="md">Personal Information</Text>
                    <Group grow>
                      <TextInput
                        label="First Name"
                        placeholder="Your first name"
                        value={user.firstName}
                        disabled
                      />
                      <TextInput
                        label="Last Name"
                        placeholder="Your last name"
                        value={user.lastName}
                        disabled
                      />
                    </Group>
                    <TextInput
                      label="Email"
                      placeholder="Your email"
                      value={user.email}
                      disabled
                    />
                    <TextInput
                      label="School"
                      placeholder="Your school"
                      value={user.schoolName || ''}
                      disabled
                    />
                    
                    {/* Editable Student Information */}
                    {user.role === 'STUDENT' && (
                      <>
                        <Select
                          label="Grade Level"
                          placeholder="Select your grade"
                          value={normalizeGrade(user.grade)}
                          onChange={(value) => setUser(prev => prev ? { ...prev, grade: value || '' } : null)}
                          data={[
                            { value: "7th Grade", label: "7th Grade" },
                            { value: "8th Grade", label: "8th Grade" },
                            { value: "9th Grade", label: "9th Grade" },
                            { value: "10th Grade", label: "10th Grade" },
                            { value: "11th Grade", label: "11th Grade" },
                            { value: "12th Grade", label: "12th Grade" },
                          ]}
                        />
                      </>
                    )}
                    <Textarea
                      label="Bio"
                      placeholder="Tell us about yourself"
                      value={user.bio || ''}
                      onChange={(e) => setUser(prev => prev ? { ...prev, bio: e.target.value } : null)}
                      rows={3}
                    />
                    
                    {user.role === 'INSTRUCTOR' && (
                      <>
                        {/* Instructor Information */}
                        <Text size="lg" fw={500} mt="md">Professional Information</Text>
                        <Textarea
                          label="Education"
                          placeholder="Your educational background and qualifications"
                          value={user.education || ''}
                          onChange={(e) => setUser(prev => prev ? { ...prev, education: e.target.value } : null)}
                          rows={3}
                        />
                        <Textarea
                          label="Experience"
                          placeholder="Your teaching and professional experience"
                          value={user.experience || ''}
                          onChange={(e) => setUser(prev => prev ? { ...prev, experience: e.target.value } : null)}
                          rows={3}
                        />
                        <TextInput
                          label="Certification URLs"
                          placeholder="Links to your certifications (comma-separated)"
                          value={user.certificationUrls || ''}
                          onChange={(e) => setUser(prev => prev ? { ...prev, certificationUrls: e.target.value } : null)}
                        />
                      </>
                    )}
                    
                    <Group justify="flex-end">
                      <Button onClick={handleSaveProfile}>Save Changes</Button>
                    </Group>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Box>
          </Tabs.Panel>

          {/* Parent Information Tab - Only for Students */}
          {user.role === 'STUDENT' && (
            <Tabs.Panel value="parent">
              <Box pt="md">
                <Stack>
                  <Text size="lg" fw={500} mb="md">Parent Contact Information</Text>
                  <TextInput
                    label="Parent Email"
                    placeholder="Parent's email address"
                    value={user.parentEmail || ''}
                    onChange={(e) => setUser(prev => prev ? { ...prev, parentEmail: e.target.value } : null)}
                  />
                  <Group justify="flex-end">
                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                  </Group>
                </Stack>
              </Box>
            </Tabs.Panel>
          )}

          {/* Address Tab */}
          <Tabs.Panel value="address">
            <Box pt="md">
              <Stack>
                <Text size="lg" fw={500} mb="md">Address Information</Text>
                <TextInput
                  label="Street Address"
                  placeholder="Enter your street address"
                  value={user.street ?? ''}
                  onChange={(e) => setUser(prev => prev ? { ...prev, street: e.target.value } : null)}
                />
                <TextInput
                  label="Apartment/Suite"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={user.apartment ?? ''}
                  onChange={(e) => setUser(prev => prev ? { ...prev, apartment: e.target.value } : null)}
                />
                <Group grow>
                  <TextInput
                    label="City"
                    placeholder="Enter your city"
                    value={user.city ?? ''}
                    onChange={(e) => setUser(prev => prev ? { ...prev, city: e.target.value } : null)}
                  />
                  <TextInput
                    label="State"
                    placeholder="Enter your state"
                    value={user.state ?? ''}
                    onChange={(e) => setUser(prev => prev ? { ...prev, state: e.target.value } : null)}
                  />
                </Group>
                <Group grow>
                  <TextInput
                    label="ZIP Code"
                    placeholder="Enter your ZIP code"
                    value={user.zip ?? ''}
                    onChange={(e) => setUser(prev => prev ? { ...prev, zip: e.target.value } : null)}
                  />
                  <TextInput
                    label="Country"
                    placeholder="Enter your country"
                    value={user.country ?? ''}
                    onChange={(e) => setUser(prev => prev ? { ...prev, country: e.target.value } : null)}
                  />
                </Group>
                <Group justify="flex-end">
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </Group>
              </Stack>
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="privacy">
            <Box pt="md">
              <Stack>
                <Text size="sm" c="dimmed" mb="md">
                  Manage your privacy settings and data
                </Text>
                <Group>
                  <Button
                    variant="light"
                    color="red"
                    onClick={openDeleteModal}
                  >
                    Delete Account
                  </Button>
                  <Button
                    variant="light"
                    onClick={() => {
                      notifications.show({
                        title: "Data Export",
                        message: "Your data export has been initiated. You will receive an email when it's ready.",
                        color: "blue",
                      });
                    }}
                  >
                    Export Data
                  </Button>
                </Group>
              </Stack>
            </Box>
          </Tabs.Panel>
        </Tabs>
      </Paper>

      {/* Delete Account Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Delete Account"
        centered
        size="md"
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete your account? This action cannot be undone.
          </Text>
          <Text size="sm" c="dimmed">
            All your data, including sessions, progress, and preferences will be permanently deleted.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="light" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default function ProfilePage() {
  return (
    <PageWrapper>
      <ProfileContent />
    </PageWrapper>
  );
}
