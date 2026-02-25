"use client";

import { useState, useEffect } from "react";
import {
  Container,
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
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  certificationUrls?: string[];
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
  
  // Modals
  const [createAdminOpened, { open: openCreateAdmin, close: closeCreateAdmin }] = useDisclosure(false);
  const [viewInstructorOpened, { open: openViewInstructor, close: closeViewInstructor }] = useDisclosure(false);
  const [selectedInstructor, setSelectedInstructor] = useState<UnverifiedInstructor | null>(null);
  
  // Create admin form
  const [createAdminForm, setCreateAdminForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: ''
  });

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
        notifications.show({
          title: 'Success',
          message: 'Admin account created successfully',
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
      <Container size="xl" py="xl">
        <Center py="xl" style={{ minHeight: 400 }}>
          <Loader size="lg" />
        </Center>
      </Container>
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

  return (
    <Container size="xl" py="xl">
      <Box pb="lg" mb="xl" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
        <Group justify="space-between" wrap="wrap">
          <div>
            <Title order={1}>Admin Dashboard</Title>
            <Text c="dimmed" mt="xs" size="sm">Manage users, instructors, and system settings</Text>
          </div>
          <Button
            leftSection={<Plus size={16} />}
            onClick={openCreateAdmin}
          >
            Create Admin Account
          </Button>
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
        </Tabs.List>

        <Tabs.Panel value="overview" pt="xl">
          {stats && (
            <Box py="lg" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
              <SimpleGrid cols={{ base: 2, sm: 4, lg: 6 }} spacing="lg">
                <StatItem title="Total Users" value={stats.users.total} icon={Users} color="#1971c2" />
                <StatItem title="Students" value={stats.users.students} icon={Users} color="#2f9e44" />
                <StatItem title="Instructors" value={stats.users.instructors} icon={UserCheck} color="#f08c00" />
                <StatItem title="Admins" value={stats.users.admins} icon={Shield} color="#9775fa" />
                <StatItem title="Total Sessions" value={stats.sessions.total} icon={Users} color="#20c997" />
                <StatItem title="Pending Verifications" value={stats.users.unverifiedInstructors} icon={AlertCircle} color="#fa5252" />
              </SimpleGrid>
            </Box>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="users" pt="xl">
          <Box py="lg" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
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
            
            <Group mb="md">
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
                      {user.verified ? (
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
                          Pending
                        </Badge>
                      </Group>
                      
                      <Text size="sm" c="dimmed" mb="md">
                        {instructor.email}
                      </Text>
                      
                      <Text size="sm" mb="xs">
                        <strong>Education:</strong> {instructor.education.length} entries
                      </Text>
                      <Text size="sm" mb="xs">
                        <strong>Experience:</strong> {instructor.experience.length} entries
                      </Text>
                      <Text size="sm" mb="md">
                        <strong>Certifications:</strong> {instructor.certificationUrls.length} documents
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
            placeholder="Enter first name"
            value={createAdminForm.firstName}
            onChange={(e) => setCreateAdminForm({ ...createAdminForm, firstName: e.target.value })}
            required
          />
          <TextInput
            label="Last Name"
            placeholder="Enter last name"
            value={createAdminForm.lastName}
            onChange={(e) => setCreateAdminForm({ ...createAdminForm, lastName: e.target.value })}
            required
          />
          <PasswordInput
            label="Password"
            placeholder="Enter password"
            value={createAdminForm.password}
            onChange={(e) => setCreateAdminForm({ ...createAdminForm, password: e.target.value })}
            required
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeCreateAdmin}>
              Cancel
            </Button>
            <Button onClick={createAdminAccount}>
              Create Account
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
              {selectedInstructor.certificationUrls.length > 0 ? (
                selectedInstructor.certificationUrls.map((url, index) => (
                  <Button
                    key={index}
                    variant="light"
                    size="sm"
                    component="a"
                    href={url}
                    target="_blank"
                    mb="xs"
                    mr="xs"
                  >
                    Document {index + 1}
                  </Button>
                ))
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
    </Container>
  );
}

export default function AdminDashboardPage() {
  return (
    <PageWrapper>
      <AdminDashboardContent />
    </PageWrapper>
  );
}
