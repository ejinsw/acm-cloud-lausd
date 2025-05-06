"use client";

import { useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import {
  TextInput,
  PasswordInput,
  Select,
  Box,
  Card,
  Title,
  Button,
  Grid,
  Tabs,
  FileInput,
  Textarea,
  MultiSelect,
  Text,
  Divider,
  Switch,
  Stack,
  Group
} from '@mantine/core';
import { useState } from 'react';
import { Student, Instructor, Subject } from '@/lib/types';
import { Upload } from 'lucide-react';

interface AccountSettingsProps {
  userRole: 'student' | 'instructor';
  student?: Student;
  instructor?: Instructor;
  subjects?: Subject[];
  onSave: (data: StudentFormData | InstructorFormData) => void;
}

interface BaseFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  street: string;
  apartment: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  birthdate: Date | null;
  schoolName: string;
  password: string;
  confirmPassword: string;
}

interface StudentFormData extends BaseFormData {
  parentEmail: string;
  grade: string;
}

interface InstructorFormData extends BaseFormData {
  bio: string;
  certifications: File[];
  credentials: string;
  subjectIds: string[];
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

export function AccountSettings({ userRole, student, instructor, subjects = [], onSave }: AccountSettingsProps) {
  const [activeTab, setActiveTab] = useState<string | null>('profile');
  
  // Student form
  const studentForm = useForm<StudentFormData>({
    initialValues: {
      firstName: student?.firstName || '',
      lastName: student?.lastName || '',
      email: student?.email || '',
      phoneNumber: '',
      street: student?.street || '',
      apartment: student?.apartment || '',
      city: student?.city || '',
      state: student?.state || '',
      zip: student?.zip || '',
      country: student?.country || '',
      birthdate: student?.birthdate ? new Date(student.birthdate) : null,
      schoolName: student?.schoolName || '',
      parentEmail: student?.parentEmail || '',
      grade: student?.grade?.toString() || '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      parentEmail: (value) => (value.length > 0 && !/^\S+@\S+$/.test(value) ? 'Invalid email' : null),
      password: (value) => (
        value.length > 0 && value.length < 8 ? 'Password must be at least 8 characters' : null
      ),
      confirmPassword: (value, values) => (
        value !== values.password ? 'Passwords do not match' : null
      ),
      zip: (value) => (value.length > 0 && !/^\d{5}(-\d{4})?$/.test(value) ? 'Invalid ZIP code' : null),
    },
  });

  // Instructor form
  const instructorForm = useForm<InstructorFormData>({
    initialValues: {
      firstName: instructor?.firstName || '',
      lastName: instructor?.lastName || '',
      email: instructor?.email || '',
      phoneNumber: '',
      street: instructor?.street || '',
      apartment: instructor?.apartment || '',
      city: instructor?.city || '',
      state: instructor?.state || '',
      zip: instructor?.zip || '',
      country: instructor?.country || '',
      birthdate: instructor?.birthdate ? new Date(instructor.birthdate) : null,
      schoolName: instructor?.schoolName || '',
      bio: '',
      certifications: [],
      credentials: '',
      subjectIds: instructor?.subjects?.map(subj => subj.id) || [],
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      password: '',
      confirmPassword: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (
        value.length > 0 && value.length < 8 ? 'Password must be at least 8 characters' : null
      ),
      confirmPassword: (value, values) => (
        value !== values.password ? 'Passwords do not match' : null
      ),
      zip: (value) => (value.length > 0 && !/^\d{5}(-\d{4})?$/.test(value) ? 'Invalid ZIP code' : null),
    },
  });

  const handleStudentSubmit = () => {
    if (!studentForm.validate().hasErrors) {
      const values = studentForm.values;
      console.log('Student form submitted:', values);
      onSave(values);
    }
  };

  const handleInstructorSubmit = () => {
    if (!instructorForm.validate().hasErrors) {
      const values = instructorForm.values;
      console.log('Instructor form submitted:', values);
      onSave(values);
    }
  };

  const subjectOptions = subjects.map(subject => ({
    value: subject.id,
    label: subject.name
  }));

  return (
    <Box mx="auto" p="md" style={{ maxWidth: '900px' }}>
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Title order={2} mb="lg">Account Settings</Title>
        
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List mb="md">
            <Tabs.Tab value="profile">Profile Information</Tabs.Tab>
            <Tabs.Tab value="address">Contact & Address</Tabs.Tab>
            <Tabs.Tab value="security">Security</Tabs.Tab>
            {userRole === 'instructor' && (
              <Tabs.Tab value="teaching">Teaching Information</Tabs.Tab>
            )}
          </Tabs.List>

          {/* Profile Tab */}
          <Tabs.Panel value="profile">
            {userRole === 'student' ? (
              <form>
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      required
                      label="First Name"
                      placeholder="Enter first name"
                      {...studentForm.getInputProps('firstName')}
                    />
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      required
                      label="Last Name"
                      placeholder="Enter last name"
                      {...studentForm.getInputProps('lastName')}
                    />
                  </Grid.Col>
                </Grid>

                <TextInput
                  required
                  label="Email"
                  placeholder="your.email@example.com"
                  mt="md"
                  {...studentForm.getInputProps('email')}
                />

                <TextInput
                  label="Parent's Email"
                  placeholder="parent.email@example.com"
                  mt="md"
                  {...studentForm.getInputProps('parentEmail')}
                />

                <Grid gutter="md" mt="md">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <DateInput
                      label="Birthdate"
                      placeholder="Select birthdate"
                      {...studentForm.getInputProps('birthdate')}
                    />
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Select
                      required
                      label="Grade"
                      placeholder="Select grade"
                      data={Array.from({ length: 8 }, (_, i) => ({
                        value: (i + 5).toString(),
                        label: `Grade ${i + 5}`,
                      }))}
                      {...studentForm.getInputProps('grade')}
                    />
                  </Grid.Col>
                </Grid>

                <TextInput
                  label="School Name"
                  placeholder="Enter your school's name"
                  mt="md"
                  {...studentForm.getInputProps('schoolName')}
                />
              </form>
            ) : (
              <form>
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      required
                      label="First Name"
                      placeholder="Enter first name"
                      {...instructorForm.getInputProps('firstName')}
                    />
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      required
                      label="Last Name"
                      placeholder="Enter last name"
                      {...instructorForm.getInputProps('lastName')}
                    />
                  </Grid.Col>
                </Grid>

                <TextInput
                  required
                  label="Email"
                  placeholder="your.email@example.com"
                  mt="md"
                  {...instructorForm.getInputProps('email')}
                />

                <DateInput
                  label="Birthdate"
                  placeholder="Select birthdate"
                  mt="md"
                  {...instructorForm.getInputProps('birthdate')}
                />

                <Textarea
                  label="Professional Bio"
                  placeholder="Tell students about yourself and your teaching experience"
                  mt="md"
                  minRows={3}
                  {...instructorForm.getInputProps('bio')}
                />

                <TextInput
                  label="Credentials"
                  placeholder="e.g., Ph.D. in Mathematics, UCLA"
                  mt="md"
                  {...instructorForm.getInputProps('credentials')}
                />

                <TextInput
                  label="School or Institution"
                  placeholder="Enter your school or institution name"
                  mt="md"
                  {...instructorForm.getInputProps('schoolName')}
                />
              </form>
            )}
          </Tabs.Panel>

          {/* Address Tab */}
          <Tabs.Panel value="address">
            <form>
              <TextInput
                label="Phone Number"
                placeholder="(123) 456-7890"
                mb="md"
                {...(userRole === 'student' 
                  ? studentForm.getInputProps('phoneNumber')
                  : instructorForm.getInputProps('phoneNumber')
                )}
              />

              <Divider label="Address Information" labelPosition="center" my="lg" />

              <TextInput
                label="Street Address"
                placeholder="123 Main St"
                mb="md"
                {...(userRole === 'student' 
                  ? studentForm.getInputProps('street')
                  : instructorForm.getInputProps('street')
                )}
              />

              <TextInput
                label="Apartment/Suite"
                placeholder="Apt 4B"
                mb="md"
                {...(userRole === 'student' 
                  ? studentForm.getInputProps('apartment')
                  : instructorForm.getInputProps('apartment')
                )}
              />

              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="City"
                    placeholder="Los Angeles"
                    mb="md"
                    {...(userRole === 'student' 
                      ? studentForm.getInputProps('city')
                      : instructorForm.getInputProps('city')
                    )}
                  />
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Grid>
                    <Grid.Col span={6}>
                      <Select
                        label="State"
                        placeholder="CA"
                        mb="md"
                        data={[
                          { value: 'CA', label: 'California' },
                          { value: 'NY', label: 'New York' },
                          { value: 'TX', label: 'Texas' },
                          // Add more states as needed
                        ]}
                        {...(userRole === 'student' 
                          ? studentForm.getInputProps('state')
                          : instructorForm.getInputProps('state')
                        )}
                      />
                    </Grid.Col>
                    
                    <Grid.Col span={6}>
                      <TextInput
                        label="ZIP Code"
                        placeholder="90001"
                        mb="md"
                        {...(userRole === 'student' 
                          ? studentForm.getInputProps('zip')
                          : instructorForm.getInputProps('zip')
                        )}
                      />
                    </Grid.Col>
                  </Grid>
                </Grid.Col>
              </Grid>

              <Select
                label="Country"
                placeholder="USA"
                mb="md"
                data={[
                  { value: 'US', label: 'United States' },
                  { value: 'CA', label: 'Canada' },
                  { value: 'MX', label: 'Mexico' },
                  // Add more countries as needed
                ]}
                {...(userRole === 'student' 
                  ? studentForm.getInputProps('country')
                  : instructorForm.getInputProps('country')
                )}
              />
            </form>
          </Tabs.Panel>

          {/* Security Tab */}
          <Tabs.Panel value="security">
            <form>
              <Text mb="md" size="sm" c="dimmed">
                Leave the password fields blank if you don&apos;t want to change your password
              </Text>
              
              <PasswordInput
                label="New Password"
                placeholder="Enter new password"
                mb="md"
                {...(userRole === 'student' 
                  ? studentForm.getInputProps('password')
                  : instructorForm.getInputProps('password')
                )}
              />
              
              <PasswordInput
                label="Confirm New Password"
                placeholder="Confirm new password"
                mb="md"
                {...(userRole === 'student' 
                  ? studentForm.getInputProps('confirmPassword')
                  : instructorForm.getInputProps('confirmPassword')
                )}
              />
            </form>
          </Tabs.Panel>

          {/* Teaching Tab (Instructors Only) */}
          {userRole === 'instructor' && (
            <Tabs.Panel value="teaching">
              <form>
                <MultiSelect
                  label="Subjects"
                  placeholder="Select subjects you can teach"
                  data={subjectOptions}
                  mb="md"
                  {...instructorForm.getInputProps('subjectIds')}
                />
                
                <FileInput
                  label="Certifications"
                  placeholder="Upload certification documents"
                  accept="application/pdf,image/*"
                  multiple
                  mb="md"
                  leftSection={<Upload size={14} />}
                  {...instructorForm.getInputProps('certifications')}
                />
                
                <Divider label="Weekly Availability" labelPosition="center" my="lg" />
                
                <Stack gap="xs">
                  <Text size="sm" fw={500} mb="xs">Select days you are available to teach:</Text>
                  
                  <Group>
                    <Switch 
                      label="Monday" 
                      {...instructorForm.getInputProps('availability.monday', { type: 'checkbox' })}
                    />
                    <Switch 
                      label="Tuesday" 
                      {...instructorForm.getInputProps('availability.tuesday', { type: 'checkbox' })}
                    />
                    <Switch 
                      label="Wednesday" 
                      {...instructorForm.getInputProps('availability.wednesday', { type: 'checkbox' })}
                    />
                    <Switch 
                      label="Thursday" 
                      {...instructorForm.getInputProps('availability.thursday', { type: 'checkbox' })}
                    />
                    <Switch 
                      label="Friday" 
                      {...instructorForm.getInputProps('availability.friday', { type: 'checkbox' })}
                    />
                    <Switch 
                      label="Saturday" 
                      {...instructorForm.getInputProps('availability.saturday', { type: 'checkbox' })}
                    />
                    <Switch 
                      label="Sunday" 
                      {...instructorForm.getInputProps('availability.sunday', { type: 'checkbox' })}
                    />
                  </Group>
                </Stack>
              </form>
            </Tabs.Panel>
          )}
        </Tabs>
        
        <Button 
          type="button" 
          fullWidth 
          mt="xl"
          onClick={userRole === 'student' ? handleStudentSubmit : handleInstructorSubmit}
        >
          Save Changes
        </Button>
      </Card>
    </Box>
  );
} 