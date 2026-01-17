"use client";

import React from 'react';
import { Alert, Button, Stack, Text, Loader, Center, Paper } from '@mantine/core';
import { IconAlertCircle, IconVideo } from '@tabler/icons-react';
import { useZoomStatus } from '@/hooks/useZoomStatus';
import { useRouter } from 'next/navigation';

interface ZoomRequiredGuardProps {
  children: React.ReactNode;
  message?: string;
  redirectToDashboard?: boolean;
}

/**
 * Guard component that checks if instructor has Zoom connected
 * Shows a warning and blocks content if Zoom is not connected
 */
export function ZoomRequiredGuard({ 
  children, 
  message = "You must connect your Zoom account before performing this action.",
  redirectToDashboard = false
}: ZoomRequiredGuardProps) {
  const { connected, expired, isLoading, error, refetch } = useZoomStatus();
  const router = useRouter();

  if (isLoading) {
    return (
      <Center h={200}>
        <Loader size="md" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert 
        color="red" 
        icon={<IconAlertCircle size={16} />}
        title="Error Checking Zoom Status"
      >
        <Stack gap="sm">
          <Text size="sm">{error}</Text>
          <Button size="xs" variant="light" onClick={refetch}>
            Retry
          </Button>
        </Stack>
      </Alert>
    );
  }

  // If Zoom is not connected or expired, show warning
  if (!connected || expired) {
    return (
      <Paper p="xl" radius="md" withBorder>
        <Stack gap="md">
          <Alert 
            color="yellow" 
            icon={<IconVideo size={20} />}
            title="Zoom Account Required"
          >
            <Stack gap="sm">
              <Text size="sm">
                {expired 
                  ? "Your Zoom connection has expired. Please reconnect to continue."
                  : message
                }
              </Text>
              <Text size="sm" c="dimmed">
                Connecting your Zoom account allows you to create sessions with embedded video meetings.
              </Text>
            </Stack>
          </Alert>

          <Stack gap="xs">
            <Button
              leftSection={<IconVideo size={16} />}
              onClick={() => router.push('/dashboard/instructor?tab=zoom')}
              fullWidth
            >
              {expired ? 'Reconnect Zoom Account' : 'Connect Zoom Account'}
            </Button>
            
            {redirectToDashboard && (
              <Button
                variant="subtle"
                onClick={() => router.push('/dashboard/instructor')}
                fullWidth
              >
                Go to Dashboard
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
    );
  }

  // Zoom is connected, render children
  return <>{children}</>;
}
