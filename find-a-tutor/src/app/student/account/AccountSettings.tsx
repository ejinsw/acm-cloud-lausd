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
} from '@mantine/core';

interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  parentEmail: string;
  phoneNumber: string;
  address: string;
  birthdate: Date;
  grade: string;
  password: string;
}

interface Props {
  className?: string;
  initialData?: StudentFormData;
}

export function AccountSettings({ className, initialData }: Props) {
  const form = useForm<StudentFormData>({
    initialValues: initialData || {
      firstName: '',
      lastName: '',
      email: '',
      parentEmail: '',
      phoneNumber: '',
      address: '',
      birthdate: new Date('2010-01-01'),
      grade: '',
      password: '',
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      parentEmail: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      phoneNumber: (value) => (
        /^\d{10}$/.test(value.replace(/\D/g, '')) ? null : 'Invalid phone number (10 digits required)'
      ),
      password: (value) => (
        value.length < 8 ? 'Password must be at least 8 characters' : null
      ),
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    console.log('Form submitted:', values);
    // TODO: Implement form submission logic
  });

  return (
    <Box className={className} mx="auto" p="md" style={{ maxWidth: '800px' }}>
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Title order={2} mb="md">Account Settings</Title>
        
        <form onSubmit={handleSubmit}>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                required
                label="First Name"
                placeholder="Enter first name"
                {...form.getInputProps('firstName')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                required
                label="Last Name"
                placeholder="Enter last name"
                {...form.getInputProps('lastName')}
              />
            </Grid.Col>
          </Grid>

          <TextInput
            required
            label="Email"
            placeholder="your.email@example.com"
            mt="md"
            {...form.getInputProps('email')}
          />

          <TextInput
            required
            label="Parent's Email"
            placeholder="parent.email@example.com"
            mt="md"
            {...form.getInputProps('parentEmail')}
          />

          <TextInput
            required
            label="Phone Number"
            placeholder="(123) 456-7890"
            mt="md"
            {...form.getInputProps('phoneNumber')}
          />

          <TextInput
            required
            label="Address"
            placeholder="Enter your address"
            mt="md"
            {...form.getInputProps('address')}
          />

          <DateInput
            label="Birthdate"
            placeholder="Select birthdate"
            mt="md"
            readOnly
            disabled
            {...form.getInputProps('birthdate')}
          />

          <Select
            required
            label="Grade"
            placeholder="Select grade"
            mt="md"
            data={Array.from({ length: 8 }, (_, i) => ({
              value: (i + 5).toString(),
              label: `Grade ${i + 5}`,
            }))}
            {...form.getInputProps('grade')}
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Enter password"
            mt="md"
            {...form.getInputProps('password')}
          />

          <Button type="submit" fullWidth mt="xl">
            Save Changes
          </Button>
        </form>
      </Card>
    </Box>
  );
}
