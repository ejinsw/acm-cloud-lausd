"use client";

import { useState, useEffect } from "react";
import {
  Title,
  Tabs,
  Text,
  Group,
  Button,
  Loader,
  Box,
  Badge,
  ActionIcon,
  Modal,
  TextInput,
  PasswordInput,
  Select,
  Stack,
  Table,
  Pagination,
  Tooltip,
  SimpleGrid,
  Divider,
  Center,
  Textarea,
  Alert,
  Paper,
  Collapse,
  MultiSelect,
} from "@mantine/core";
import { 
  Users, 
  UserCheck, 
  Shield, 
  Settings, 
  Eye, 
  Trash2, 
  RefreshCw, 
  Plus,
  Search,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { getToken } from "@/actions/authentication";
import { useSettings } from "@/hooks/useSettings";

interface AdminStats {
  users: {
    total: number;
    students: number;
    instructors: number;
    admins: number;
    unverifiedInstructors: number;
  };
  sessions: {
    total: number;
    active: number;
  };
  reviews: {
    total: number;
  };
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  verified: boolean;
  instructorReviewStatus?: 'UNDER_REVIEW' | 'APPROVED';
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  certificationUrls?: string[];
}

interface VerificationDocument {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
  downloadUrl?: string | null;
}

interface UnverifiedInstructor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  education: string[];
  experience: string[];
  certificationUrls: string[];
  bio: string;
  createdAt: string;
  instructorReviewStatus: 'UNDER_REVIEW' | 'APPROVED';
  verificationDocuments: VerificationDocument[];
}

function AdminDashboardContent() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [unverifiedInstructors, setUnverifiedInstructors] = useState<UnverifiedInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>("overview");
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersRoleFilter, setUsersRoleFilter] = useState<string>("");
  const [usersVerifiedFilter, setUsersVerifiedFilter] = useState<string>("");
  const [newSubject, setNewSubject] = useState("");
  const [newSchool, setNewSchool] = useState("");
  const [fieldKey, setFieldKey] = useState("");
  const [fieldValueInput, setFieldValueInput] = useState("");
  const [settingsActionLoading, setSettingsActionLoading] = useState<string | null>(null);
  const [customFieldsOpen, setCustomFieldsOpen] = useState(false);
  
  // Modals
  const [createAdminOpened, { open: openCreateAdmin, close: closeCreateAdmin }] = useDisclosure(false);
  const [createInstructorOpened, { open: openCreateInstructor, close: closeCreateInstructor }] = useDisclosure(false);
  const [viewInstructorOpened, { open: openViewInstructor, close: closeViewInstructor }] = useDisclosure(false);
  const [selectedInstructor, setSelectedInstructor] = useState<UnverifiedInstructor | null>(null);

  const {
    settings,
    isLoading: settingsLoading,
    error: settingsError,
    refetch: refetchSettings,
    initialize: initializeSettings,
    addSubjectField,
    removeSubjectField,
    addSchoolField,
    removeSchoolField,
    setField,
    deleteField,
  } = useSettings();
  
  // Create admin form
  const [createAdminForm, setCreateAdminForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: ''
  });
  const [createInstructorForm, setCreateInstructorForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    subjects: [] as string[],
  });
  const subjectOptions = (settings?.subjects || []).map((subject) => ({
    value: subject,
    label: subject,
  }));

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const fetchStats = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async (page = 1, search = "", roleFilter = "", verifiedFilter = "") => {
    try {
      const token = await getToken();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(verifiedFilter && { verified: verifiedFilter })
      });
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setUsersTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchUnverifiedInstructors = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/instructors/unverified`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnverifiedInstructors(data.instructors);
      }
    } catch (error) {
      console.error('Error fetching unverified instructors:', error);
    }
  };

  const verifyInstructor = async (instructorId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/instructors/${instructorId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Instructor verified successfully',
          color: 'green'
        });
        await fetchUnverifiedInstructors();
        await fetchStats();
      } else {
        const error = await response.json();
        notifications.show({
          title: 'Error',
          message: error.message || 'Failed to verify instructor',
          color: 'red'
        });
      }
    } catch (error) {
      console.error('Error verifying instructor:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to verify instructor',
        color: 'red'
      });
    }
  };

  const createAdminAccount = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createAdminForm)
      });
      
      if (response.ok) {
        const data = await response.json();
        notifications.show({
          title: 'Success',
          message: data.message || 'Admin account action completed',
          color: 'green'
        });
        setCreateAdminForm({ email: '', firstName: '', lastName: '', password: '' });
        closeCreateAdmin();
        await fetchUsers(usersPage, usersSearch, usersRoleFilter, usersVerifiedFilter);
        await fetchStats();
      } else {
        const error = await response.json();
        notifications.show({
          title: 'Error',
          message: error.message || 'Failed to create admin account',
          color: 'red'
        });
      }
    } catch (error) {
      console.error('Error creating admin account:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create admin account',
        color: 'red'
      });
    }
  };

  const createInstructorAccount = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/accounts/instructor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createInstructorForm)
      });

      if (response.ok) {
        const data = await response.json();
        notifications.show({
          title: 'Success',
          message: data.message || 'Instructor account action completed',
          color: 'green'
        });
        setCreateInstructorForm({
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          subjects: [],
        });
        closeCreateInstructor();
        await fetchUsers(usersPage, usersSearch, usersRoleFilter, usersVerifiedFilter);
        await fetchStats();
      } else {
        const error = await response.json();
        notifications.show({
          title: 'Error',
          message: error.message || 'Failed to create instructor account',
          color: 'red'
        });
      }
    } catch (error) {
      console.error('Error creating instructor account:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create instructor account',
        color: 'red'
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'User deleted successfully',
          color: 'green'
        });
        await fetchUsers(usersPage, usersSearch, usersRoleFilter, usersVerifiedFilter);
        await fetchStats();
      } else {
        const error = await response.json();
        notifications.show({
          title: 'Error',
          message: error.message || 'Failed to delete user',
          color: 'red'
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete user',
        color: 'red'
      });
    }
  };

  const confirmUser = async (userId: string) => {
    if (!confirm('Are you sure you want to manually confirm this user account? This will allow them to log in immediately.')) {
      return;
    }
    
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'User account confirmed successfully',
          color: 'green'
        });
        await fetchUsers(usersPage, usersSearch, usersRoleFilter, usersVerifiedFilter);
        await fetchStats();
      } else {
        const error = await response.json();
        notifications.show({
          title: 'Error',
          message: error.message || 'Failed to confirm user',
          color: 'red'
        });
      }
    } catch (error) {
      console.error('Error confirming user:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to confirm user',
        color: 'red'
      });
    }
  };

  const runSettingsAction = async (
    actionKey: string,
    action: (token: string) => Promise<void>,
  ) => {
    setSettingsActionLoading(actionKey);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token not available");
      }
      await action(token);
    } finally {
      setSettingsActionLoading(null);
    }
  };

  const handleInitializeSettings = async () => {
    try {
      await runSettingsAction("initialize-settings", async (token) => {
        const result = await initializeSettings(token);
        notifications.show({
          title: "Settings initialized",
          message: result.created
            ? "Default settings were created successfully."
            : "Settings already existed. No changes were made.",
          color: "green",
        });
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to initialize settings";
      notifications.show({
        title: "Error",
        message,
        color: "red",
      });
    }
  };

  const handleAddSubject = async () => {
    const subject = newSubject.trim();
    if (!subject) return;

    try {
      await runSettingsAction("add-subject", async (token) => {
        await addSubjectField(token, subject);
      });
      notifications.show({
        title: "Subject added",
        message: `"${subject}" is now available in settings.`,
        color: "green",
      });
      setNewSubject("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add subject";
      notifications.show({
        title: "Error",
        message,
        color: "red",
      });
    }
  };

  const handleRemoveSubject = async (subject: string) => {
    try {
      await runSettingsAction(`remove-subject-${subject}`, async (token) => {
        await removeSubjectField(token, subject);
      });
      notifications.show({
        title: "Subject removed",
        message: `"${subject}" was removed from settings.`,
        color: "green",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove subject";
      notifications.show({
        title: "Error",
        message,
        color: "red",
      });
    }
  };

  const handleAddSchool = async () => {
    const school = newSchool.trim();
    if (!school) return;

    try {
      await runSettingsAction("add-school", async (token) => {
        await addSchoolField(token, school);
      });
      notifications.show({
        title: "School added",
        message: `"${school}" is now available in settings.`,
        color: "green",
      });
      setNewSchool("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add school";
      notifications.show({
        title: "Error",
        message,
        color: "red",
      });
    }
  };

  const handleRemoveSchool = async (school: string) => {
    try {
      await runSettingsAction(`remove-school-${school}`, async (token) => {
        await removeSchoolField(token, school);
      });
      notifications.show({
        title: "School removed",
        message: `"${school}" was removed from settings.`,
        color: "green",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove school";
      notifications.show({
        title: "Error",
        message,
        color: "red",
      });
    }
  };

  const handleSetField = async () => {
    const key = fieldKey.trim();
    if (!key) return;

    let parsedValue: unknown = fieldValueInput;
    if (fieldValueInput.trim()) {
      try {
        parsedValue = JSON.parse(fieldValueInput);
      } catch {
        parsedValue = fieldValueInput;
      }
    }

    try {
      await runSettingsAction("set-field", async (token) => {
        await setField(token, key, parsedValue);
      });
      notifications.show({
        title: "Field updated",
        message: `Top-level field "${key}" was saved.`,
        color: "green",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to set field";
      notifications.show({
        title: "Error",
        message,
        color: "red",
      });
    }
  };

  const handleDeleteField = async (key: string) => {
    try {
      await runSettingsAction(`delete-field-${key}`, async (token) => {
        await deleteField(token, key);
      });
      notifications.show({
        title: "Field deleted",
        message: `Top-level field "${key}" was removed.`,
        color: "green",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete field";
      notifications.show({
        title: "Error",
        message,
        color: "red",
      });
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchUnverifiedInstructors()
      ]);
      setLoading(false);
    };

    initializeData();
  }, []);

  useEffect(() => {
    fetchUsers(usersPage, usersSearch, usersRoleFilter, usersVerifiedFilter);
  }, [usersPage, usersSearch, usersRoleFilter, usersVerifiedFilter]);

  if (loading) {
    return (
      <Box py="xl">
        <Center py="xl" style={{ minHeight: 400 }}>
          <Loader size="lg" />
        </Center>
      </Box>
    );
  }

  const StatItem = ({ title, value, icon: Icon, color }: {
    title: string;
    value: number;
    icon: React.ComponentType<{ size?: number; color?: string }>;
    color: string;
  }) => (
    <Group gap="sm">
      <Icon size={24} color={color} />
      <Box>
        <Text size="sm" c="dimmed" tt="uppercase">{title}</Text>
        <Text fw={700} size="xl">{value}</Text>
      </Box>
    </Group>
  );

  const customFields = settings
    ? Object.entries(settings).filter(([key]) => key !== "subjects" && key !== "schools")
    : [];

  return (
    <Box py="lg" className="app-page-grid">
      <Box p="xl" className="app-glass" style={{ borderRadius: 14 }}>
        <Group justify="space-between" wrap="wrap">
          <div>
            <Title order={2}>Admin Operations</Title>
            <Text c="dimmed" mt="xs" size="sm">
              System controls, risk signals, and user verification workflows.
            </Text>
          </div>
          <Group>
            <Button
              variant="light"
              leftSection={<Plus size={16} />}
              onClick={openCreateInstructor}
            >
              Create Instructor Account
            </Button>
            <Button
              leftSection={<Plus size={16} />}
              onClick={openCreateAdmin}
            >
              Create Admin Account
            </Button>
          </Group>
        </Group>
      </Box>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List grow>
          <Tabs.Tab value="overview" leftSection={<Settings size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="users" leftSection={<Users size={16} />}>
            User Management
          </Tabs.Tab>
          <Tabs.Tab 
            value="instructors" 
            leftSection={<UserCheck size={16} />}
            rightSection={
              unverifiedInstructors.length > 0 && (
                <Badge size="sm" color="red">
                  {unverifiedInstructors.length}
                </Badge>
              )
            }
          >
            Instructor Verification
          </Tabs.Tab>
          <Tabs.Tab value="settings" leftSection={<Settings size={16} />}>
            Settings
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="xl">
          {stats && (
            <Box py="lg">
              <SimpleGrid cols={{ base: 2, sm: 4, lg: 6 }} spacing="lg">
                <StatItem title="Total Users" value={stats.users.total} icon={Users} color="#1971c2" />
                <StatItem title="Students" value={stats.users.students} icon={Users} color="#2f9e44" />
                <StatItem title="Instructors" value={stats.users.instructors} icon={UserCheck} color="#f08c00" />
                <StatItem title="Admins" value={stats.users.admins} icon={Shield} color="#9775fa" />
                <StatItem title="Total Sessions" value={stats.sessions.total} icon={Users} color="#20c997" />
                <StatItem title="Pending Verifications" value={stats.users.unverifiedInstructors} icon={AlertCircle} color="#fa5252" />
              </SimpleGrid>
              {stats.users.unverifiedInstructors > 0 && (
                <Alert mt="xl" color="yellow" title="Risk Alert">
                  {stats.users.unverifiedInstructors} instructors are awaiting verification. Prioritize this queue to keep
                  onboarding clear and compliant.
                </Alert>
              )}
            </Box>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="users" pt="xl">
          <Box py="lg">
            <Group justify="space-between" mb="md">
              <Text fw={500}>User Management</Text>
              <Button
                leftSection={<RefreshCw size={16} />}
                variant="light"
                onClick={() => fetchUsers(usersPage, usersSearch, usersRoleFilter, usersVerifiedFilter)}
              >
                Refresh
              </Button>
            </Group>
            
            <Box
              mb="md"
              style={{
                position: "sticky",
                top: 12,
                zIndex: 20,
                padding: "10px",
                borderRadius: 12,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.88))",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(39,116,174,0.12)",
              }}
            >
              <Group>
                <TextInput
                  placeholder="Search users..."
                  leftSection={<Search size={16} />}
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Select
                  placeholder="Filter by role"
                  data={[
                    { value: '', label: 'All Roles' },
                    { value: 'STUDENT', label: 'Students' },
                    { value: 'INSTRUCTOR', label: 'Instructors' },
                    { value: 'ADMIN', label: 'Admins' }
                  ]}
                  value={usersRoleFilter}
                  onChange={(value) => setUsersRoleFilter(value || '')}
                  clearable
                />
                <Select
                  placeholder="Filter by verification"
                  data={[
                    { value: '', label: 'All Users' },
                    { value: 'true', label: 'Verified' },
                    { value: 'false', label: 'Unverified' }
                  ]}
                  value={usersVerifiedFilter}
                  onChange={(value) => setUsersVerifiedFilter(value || '')}
                  clearable
                />
              </Group>
            </Box>

            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {users.map((user) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>{user.firstName} {user.lastName}</Table.Td>
                    <Table.Td>{user.email}</Table.Td>
                    <Table.Td>
                      <Badge
                        color={
                          user.role === 'ADMIN' ? 'violet' :
                          user.role === 'INSTRUCTOR' ? 'orange' : 'blue'
                        }
                        variant="light"
                      >
                        {user.role}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {user.role === 'INSTRUCTOR' ? (
                        <Badge
                          color={user.instructorReviewStatus === 'UNDER_REVIEW' ? 'orange' : 'green'}
                          variant="light"
                        >
                          {user.instructorReviewStatus === 'UNDER_REVIEW' ? 'Under Review' : 'Approved'}
                        </Badge>
                      ) : user.verified ? (
                        <Badge color="green" variant="light">
                          Verified
                        </Badge>
                      ) : (
                        <Badge color="red" variant="light">
                          Unverified
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {!user.verified && (
                          <Tooltip label="Confirm Account">
                            <ActionIcon
                              color="green"
                              variant="light"
                              onClick={() => confirmUser(user.id)}
                            >
                              <UserCheck size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        <Tooltip label="Delete User">
                          <ActionIcon
                            color="red"
                            variant="light"
                            onClick={() => deleteUser(user.id)}
                            disabled={user.role === 'ADMIN' && user.id === user?.id}
                          >
                            <Trash2 size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            <Group justify="center" mt="md">
              <Pagination
                value={usersPage}
                onChange={setUsersPage}
                total={Math.ceil(usersTotal / 10)}
              />
            </Group>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="instructors" pt="xl">
          <Box py="lg" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
            <Group justify="space-between" mb="md">
              <Text fw={500}>Instructor Verification</Text>
              <Button
                leftSection={<RefreshCw size={16} />}
                variant="light"
                onClick={fetchUnverifiedInstructors}
              >
                Refresh
              </Button>
            </Group>

            {unverifiedInstructors.length === 0 ? (
              <Text ta="center" c="dimmed" py="xl">
                No instructors pending verification
              </Text>
            ) : (
              <Stack gap={0}>
                {unverifiedInstructors.map((instructor, index) => (
                  <Box key={instructor.id}>
                    {index > 0 && <Divider />}
                    <Box py="lg">
                      <Group justify="space-between" mb="xs">
                        <Text fw={500}>{instructor.firstName} {instructor.lastName}</Text>
                        <Badge color="orange" variant="light">
                          {instructor.instructorReviewStatus === 'UNDER_REVIEW' ? 'Under Review' : 'Approved'}
                        </Badge>
                      </Group>
                      
                      <Text size="sm" c="dimmed" mb="md">
                        {instructor.email}
                      </Text>
                      
                      <Text size="sm" mb="xs">
                        <strong>Education:</strong> {instructor.education?.length || 0} entries
                      </Text>
                      <Text size="sm" mb="xs">
                        <strong>Experience:</strong> {instructor.experience?.length || 0} entries
                      </Text>
                      <Text size="sm" mb="md">
                        <strong>Verification Files:</strong> {instructor.verificationDocuments?.length || 0} uploaded
                      </Text>
                      
                      <Group justify="space-between">
                        <Button
                          variant="light"
                          leftSection={<Eye size={16} />}
                          onClick={() => {
                            setSelectedInstructor(instructor);
                            openViewInstructor();
                          }}
                        >
                          Review
                        </Button>
                        <Button
                          color="green"
                          leftSection={<CheckCircle size={16} />}
                          onClick={() => verifyInstructor(instructor.id)}
                        >
                          Verify
                        </Button>
                      </Group>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="settings" pt="xl">
          <Box py="lg">
            <Group justify="space-between" mb="md">
              <Text fw={500}>Platform Settings</Text>
              <Group>
                <Button
                  leftSection={<RefreshCw size={16} />}
                  variant="light"
                  onClick={() => void refetchSettings()}
                  loading={settingsLoading}
                >
                  Refresh
                </Button>
                {!settings && !settingsLoading && (
                  <Button
                    leftSection={<Plus size={16} />}
                    onClick={handleInitializeSettings}
                    loading={settingsActionLoading === "initialize-settings"}
                  >
                    Initialize Defaults
                  </Button>
                )}
              </Group>
            </Group>

            {settingsError && (
              <Alert color="red" mb="md" title="Failed to load settings">
                {settingsError}
              </Alert>
            )}

            {settingsLoading ? (
              <Center py="xl">
                <Loader />
              </Center>
            ) : !settings ? (
              <Alert color="yellow" title="Settings are not initialized">
                Run “Initialize Defaults” to create the singleton settings document.
              </Alert>
            ) : (
              <Stack gap="lg">
                <Paper withBorder p="md">
                  <Text fw={500} mb="sm">Subjects</Text>
                  <Group mb="md">
                    <TextInput
                      placeholder="Add subject"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.currentTarget.value)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      onClick={handleAddSubject}
                      loading={settingsActionLoading === "add-subject"}
                    >
                      Add
                    </Button>
                  </Group>
                  <Group gap="xs">
                    {settings.subjects.length === 0 ? (
                      <Text c="dimmed" size="sm">No subjects configured.</Text>
                    ) : (
                      settings.subjects.map((subject) => (
                        <Group key={subject} gap={4}>
                          <Badge color="blue" variant="light">{subject}</Badge>
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => void handleRemoveSubject(subject)}
                            disabled={settingsActionLoading === `remove-subject-${subject}`}
                          >
                            <Trash2 size={14} />
                          </ActionIcon>
                        </Group>
                      ))
                    )}
                  </Group>
                </Paper>

                <Paper withBorder p="md">
                  <Text fw={500} mb="sm">Schools</Text>
                  <Group mb="md">
                    <TextInput
                      placeholder="Add school"
                      value={newSchool}
                      onChange={(e) => setNewSchool(e.currentTarget.value)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      onClick={handleAddSchool}
                      loading={settingsActionLoading === "add-school"}
                    >
                      Add
                    </Button>
                  </Group>
                  <Group gap="xs">
                    {settings.schools.length === 0 ? (
                      <Text c="dimmed" size="sm">No schools configured.</Text>
                    ) : (
                      settings.schools.map((school) => (
                        <Group key={school} gap={4}>
                          <Badge color="grape" variant="light">{school}</Badge>
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => void handleRemoveSchool(school)}
                            disabled={settingsActionLoading === `remove-school-${school}`}
                          >
                            <Trash2 size={14} />
                          </ActionIcon>
                        </Group>
                      ))
                    )}
                  </Group>
                </Paper>

                <Paper withBorder p="md">
                  <Group justify="space-between" align="center">
                    <Text fw={500} c="dimmed">Advanced</Text>
                    <Button
                      size="xs"
                      variant="subtle"
                      onClick={() => setCustomFieldsOpen((open) => !open)}
                    >
                      {customFieldsOpen ? "Hide custom fields" : "Manage custom fields"}
                    </Button>
                  </Group>
                  <Collapse in={customFieldsOpen}>
                    <Divider my="sm" />
                    <Stack gap="xs" mb="md">
                      {customFields.length === 0 ? (
                        <Text c="dimmed" size="sm">No custom fields configured.</Text>
                      ) : (
                        customFields.map(([key, value]) => (
                          <Group key={key} justify="space-between" align="flex-start">
                            <div>
                              <Text fw={500}>{key}</Text>
                              <Text size="xs" c="dimmed">
                                {JSON.stringify(value)}
                              </Text>
                            </div>
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              onClick={() => void handleDeleteField(key)}
                              disabled={settingsActionLoading === `delete-field-${key}`}
                            >
                              <Trash2 size={14} />
                            </ActionIcon>
                          </Group>
                        ))
                      )}
                    </Stack>

                    <Divider my="sm" />

                    <Stack gap="sm">
                      <TextInput
                        label="Field Key"
                        placeholder="exampleFlag"
                        value={fieldKey}
                        onChange={(e) => setFieldKey(e.currentTarget.value)}
                      />
                      <Textarea
                        label="Field Value"
                        placeholder='Use JSON (e.g. {"enabled":true}) or plain text'
                        minRows={3}
                        value={fieldValueInput}
                        onChange={(e) => setFieldValueInput(e.currentTarget.value)}
                      />
                      <Group justify="flex-end">
                        <Button
                          onClick={handleSetField}
                          loading={settingsActionLoading === "set-field"}
                        >
                          Save Field
                        </Button>
                      </Group>
                    </Stack>
                  </Collapse>
                </Paper>
              </Stack>
            )}
          </Box>
        </Tabs.Panel>
      </Tabs>

      {/* Create Admin Modal */}
      <Modal opened={createAdminOpened} onClose={closeCreateAdmin} title="Create Admin Account">
        <Stack>
          <TextInput
            label="Email"
            placeholder="Enter email"
            value={createAdminForm.email}
            onChange={(e) => setCreateAdminForm({ ...createAdminForm, email: e.target.value })}
            required
          />
          <TextInput
            label="First Name"
            description="Used when creating a brand-new account."
            placeholder="Optional if user already exists"
            value={createAdminForm.firstName}
            onChange={(e) => setCreateAdminForm({ ...createAdminForm, firstName: e.target.value })}
          />
          <TextInput
            label="Last Name"
            description="Used when creating a brand-new account."
            placeholder="Optional if user already exists"
            value={createAdminForm.lastName}
            onChange={(e) => setCreateAdminForm({ ...createAdminForm, lastName: e.target.value })}
          />
          <PasswordInput
            label="Password"
            description="Required only when creating a brand-new account."
            placeholder="Optional if user already exists"
            value={createAdminForm.password}
            onChange={(e) => setCreateAdminForm({ ...createAdminForm, password: e.target.value })}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeCreateAdmin}>
              Cancel
            </Button>
            <Button onClick={createAdminAccount}>
              Submit
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Create Instructor Modal */}
      <Modal opened={createInstructorOpened} onClose={closeCreateInstructor} title="Create Instructor Account">
        <Stack>
          <TextInput
            label="Email"
            placeholder="Enter email"
            value={createInstructorForm.email}
            onChange={(e) => setCreateInstructorForm({ ...createInstructorForm, email: e.target.value })}
            required
          />
          <TextInput
            label="First Name"
            placeholder="Enter first name"
            value={createInstructorForm.firstName}
            onChange={(e) => setCreateInstructorForm({ ...createInstructorForm, firstName: e.target.value })}
            required
          />
          <TextInput
            label="Last Name"
            placeholder="Enter last name"
            value={createInstructorForm.lastName}
            onChange={(e) => setCreateInstructorForm({ ...createInstructorForm, lastName: e.target.value })}
            required
          />
          <PasswordInput
            label="Password"
            placeholder="Enter password"
            value={createInstructorForm.password}
            onChange={(e) => setCreateInstructorForm({ ...createInstructorForm, password: e.target.value })}
            required
          />
          <MultiSelect
            label="Credentialed Subjects"
            description="Required. Instructor accounts created by admins are auto-approved."
            data={subjectOptions}
            placeholder="Select one or more subjects"
            value={createInstructorForm.subjects}
            onChange={(value) => setCreateInstructorForm({ ...createInstructorForm, subjects: value })}
            searchable
            required
            disabled={subjectOptions.length === 0}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeCreateInstructor}>
              Cancel
            </Button>
            <Button onClick={createInstructorAccount} disabled={createInstructorForm.subjects.length === 0}>
              Create Instructor
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* View Instructor Modal */}
      <Modal 
        opened={viewInstructorOpened} 
        onClose={closeViewInstructor} 
        title="Instructor Details"
        size="lg"
      >
        {selectedInstructor && (
          <Stack>
            <Group>
              <div>
                <Text fw={500} size="lg">
                  {selectedInstructor.firstName} {selectedInstructor.lastName}
                </Text>
                <Text c="dimmed">{selectedInstructor.email}</Text>
              </div>
            </Group>
            
            <div>
              <Text fw={500} mb="xs">Bio</Text>
              <Text size="sm">{selectedInstructor.bio || 'No bio provided'}</Text>
            </div>
            
            <div>
              <Text fw={500} mb="xs">Education</Text>
              {selectedInstructor.education.length > 0 ? (
                selectedInstructor.education.map((edu, index) => (
                  <Text key={index} size="sm">• {edu}</Text>
                ))
              ) : (
                <Text size="sm" c="dimmed">No education listed</Text>
              )}
            </div>
            
            <div>
              <Text fw={500} mb="xs">Experience</Text>
              {selectedInstructor.experience.length > 0 ? (
                selectedInstructor.experience.map((exp, index) => (
                  <Text key={index} size="sm">• {exp}</Text>
                ))
              ) : (
                <Text size="sm" c="dimmed">No experience listed</Text>
              )}
            </div>
            
            <div>
              <Text fw={500} mb="xs">Certification Documents</Text>
              {selectedInstructor.verificationDocuments?.length > 0 ? (
                <Stack gap="xs">
                  {selectedInstructor.verificationDocuments.map((doc) => (
                    <Group key={doc.id} justify="space-between" wrap="wrap">
                      <div>
                        <Text size="sm" fw={500}>{doc.fileName}</Text>
                        <Text size="xs" c="dimmed">
                          {doc.contentType} • {formatFileSize(doc.sizeBytes)} • {new Date(doc.createdAt).toLocaleDateString()}
                        </Text>
                      </div>
                      {doc.downloadUrl ? (
                        <Button
                          variant="light"
                          size="xs"
                          component="a"
                          href={doc.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open
                        </Button>
                      ) : (
                        <Badge color="gray" variant="light">Unavailable</Badge>
                      )}
                    </Group>
                  ))}
                </Stack>
              ) : (
                <Text size="sm" c="dimmed">No documents uploaded</Text>
              )}
            </div>
            
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeViewInstructor}>
                Close
              </Button>
              <Button
                color="green"
                leftSection={<CheckCircle size={16} />}
                onClick={() => {
                  verifyInstructor(selectedInstructor.id);
                  closeViewInstructor();
                }}
              >
                Verify Instructor
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Box>
  );
}

export default function AdminDashboardPage() {
  return (
    <PageWrapper>
      <AdminDashboardContent />
    </PageWrapper>
  );
}
