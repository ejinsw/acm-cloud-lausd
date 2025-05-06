"use client";

import { Container, Title, Tabs, Loader, Center, Alert, Paper, Avatar, Text, Group, Button, Badge } from '@mantine/core';
import { useEffect, useState } from 'react';
import { AccountSettings } from '@/components/account/AccountSettings';
import { Student, Instructor, Subject, User } from '@/lib/types';
import { Bell, CalendarClock, Star, AlertTriangle } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

// Mock data for demo
const mockSubjects: Subject[] = [
  { id: '1', name: 'Mathematics' },
  { id: '2', name: 'English' },
  { id: '3', name: 'Science' },
  { id: '4', name: 'History' },
  { id: '5', name: 'Computer Science' },
];

const mockStudentUser: User = {
  id: '123',
  email: 'student@example.com',
  role: 'student',
  student: {
    id: '123',
    firstName: 'John',
    lastName: 'Student',
    email: 'student@example.com',
    grade: 8,
    birthdate: '2008-05-15',
    schoolName: 'Lincoln Middle School',
    street: '123 Main St',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90001',
    parentEmail: 'parent@example.com',
  }
};

const mockInstructorUser: User = {
  id: '456',
  email: 'instructor@example.com',
  role: 'instructor',
  instructor: {
    id: '456',
    firstName: 'Jane',
    lastName: 'Instructor',
    email: 'instructor@example.com',
    birthdate: '1985-10-20',
    schoolName: 'UCLA',
    street: '456 University Ave',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90095',
    averageRating: 4.8,
    subjects: [
      { id: '1', name: 'Mathematics' },
      { id: '3', name: 'Science' }
    ],
    certificationUrls: ['certificate1.pdf', 'certificate2.pdf'],
  }
};

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab');
  
  // In a real application, you would fetch the user data from an API or context
  // For this demo, we'll use a state to toggle between student and instructor views
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>(tabParam || 'profile');
  const [demoUserRole, setDemoUserRole] = useState<'student' | 'instructor'>('student');

  // Update activeTab when the tab query parameter changes
  useEffect(() => {
    if (tabParam && ['profile', 'settings', 'progress', 'analytics'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Simulate API call to fetch user data
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setUser(demoUserRole === 'student' ? mockStudentUser : mockInstructorUser);
      setIsLoading(false);
    }, 500);
  }, [demoUserRole]);

  const handleSaveSettings = (data: any) => {
    console.log('Saving settings:', data);
    // In a real app, this would make an API call to update user data
    alert('Settings saved successfully!');
  };

  const toggleDemoUserRole = () => {
    setDemoUserRole(prev => prev === 'student' ? 'instructor' : 'student');
  };

  const handleTabChange = (value: string | null) => {
    setActiveTab(value);
    if (value) {
      router.push(`/profile${value !== 'profile' ? `?tab=${value}` : ''}`);
    }
  };

  if (isLoading) {
    return (
      <Container size="lg" py="xl">
        <Center style={{ height: 200 }}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<AlertTriangle size={16} />} title="Not Logged In" color="red">
          You need to be logged in to view this page.
        </Alert>
      </Container>
    );
  }

  const userInfo = user.role === 'student' ? user.student : user.instructor;
  const isStudent = user.role === 'student';
  
  return (
    <Container size="lg" py="xl">
      {/* This button is just for demo purposes to toggle between student/instructor views */}
      <Group justify="flex-end" mb="md">
        <Button variant="outline" onClick={toggleDemoUserRole}>
          Demo: Switch to {demoUserRole === 'student' ? 'Instructor' : 'Student'} View
        </Button>
      </Group>

      <Paper p="md" radius="md" withBorder mb="xl">
        <Group justify="space-between">
          <Group>
            <Avatar 
              size="xl" 
              radius="xl" 
              src={`https://ui-avatars.com/api/?name=${userInfo?.firstName}+${userInfo?.lastName}&background=random`}
            />
            <div>
              <Title order={3}>
                {userInfo?.firstName} {userInfo?.lastName}
              </Title>
              <Text c="dimmed">{user.email}</Text>
              <Group mt="xs">
                <Badge color={isStudent ? 'blue' : 'green'}>
                  {isStudent ? 'Student' : 'Instructor'}
                </Badge>
                {!isStudent && user.instructor?.averageRating && (
                  <Badge color="yellow" leftSection={<Star size={12} />}>
                    {user.instructor.averageRating.toFixed(1)}
                  </Badge>
                )}
              </Group>
            </div>
          </Group>
          
          <Group>
            <Button variant="light" leftSection={<Bell size={16} />}>
              Notifications
            </Button>
            <Button leftSection={<CalendarClock size={16} />}>
              {isStudent ? 'My Sessions' : 'Manage Sessions'}
            </Button>
          </Group>
        </Group>
      </Paper>

      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tabs.List mb="xl">
          <Tabs.Tab value="profile">Profile</Tabs.Tab>
          <Tabs.Tab value="settings">Settings</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="profile">
          {/* Profile content would go here - for now, just showing settings */}
          <AccountSettings 
            userRole={user.role as 'student' | 'instructor'}
            student={isStudent ? user.student : undefined}
            instructor={!isStudent ? user.instructor : undefined}
            subjects={mockSubjects}
            onSave={handleSaveSettings}
          />
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <AccountSettings 
            userRole={user.role as 'student' | 'instructor'}
            student={isStudent ? user.student : undefined}
            instructor={!isStudent ? user.instructor : undefined}
            subjects={mockSubjects}
            onSave={handleSaveSettings}
          />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
} 