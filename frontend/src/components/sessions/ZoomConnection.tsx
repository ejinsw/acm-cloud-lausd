"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Alert,
  Stack,
  Text,
  Group,
  Badge,
  Modal,
  Center,
  Loader,
} from "@mantine/core";
import {
  IconVideo,
  IconCheck,
  IconX,
  IconExternalLink,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { getToken } from "@/actions/authentication";

interface ZoomConnectionProps {
  onConnected?: () => void;
  onDisconnected?: () => void;
}

interface ZoomStatus {
  connected: boolean;
  expired: boolean;
  needsReconnect: boolean;
}

const ZoomConnection: React.FC<ZoomConnectionProps> = ({
  onDisconnected,
}) => {
  const [zoomStatus, setZoomStatus] = useState<ZoomStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Check Zoom connection status
  const checkZoomStatus = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();

      if (!token) {
        console.warn("No authentication token found");
        setZoomStatus({
          connected: false,
          expired: false,
          needsReconnect: false,
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/zoom/status`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        // If 403, user is not an instructor - show not connected
        if (response.status === 403) {
          setZoomStatus({
            connected: false,
            expired: false,
            needsReconnect: false,
          });
          setIsLoading(false);
          return;
        }
        throw new Error("Failed to check Zoom status");
      }

      const data = await response.json();
      setZoomStatus(data);
    } catch (error) {
      console.error("Error checking Zoom status:", error);
      notifications.show({
        title: "Error",
        message: "Failed to check Zoom connection status",
        color: "red",
      });
      // Set a default status so UI doesn't break
      setZoomStatus({
        connected: false,
        expired: false,
        needsReconnect: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to Zoom
  const connectZoom = async () => {
    try {
      setIsConnecting(true);
      const token = await getToken();

      if (!token) {
        notifications.show({
          title: "Authentication Required",
          message: "Please log in to connect your Zoom account",
          color: "red",
        });
        setIsConnecting(false);
        return;
      }

      // Store token temporarily for the OAuth flow
      sessionStorage.setItem('zoom_auth_token', token);
      
      // Redirect to Zoom OAuth endpoint
      // The backend will handle the redirect to Zoom
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/zoom/connect?token=${encodeURIComponent(token)}`;
    } catch (error) {
      console.error("Error connecting to Zoom:", error);
      notifications.show({
        title: "Error",
        message: "Failed to connect to Zoom",
        color: "red",
      });
      setIsConnecting(false);
    }
  };

  // Disconnect from Zoom
  const disconnectZoom = async () => {
    try {
      const token = await getToken();

      if (!token) {
        notifications.show({
          title: "Authentication Required",
          message: "Please log in to disconnect your Zoom account",
          color: "red",
        });
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/zoom/disconnect`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to disconnect from Zoom");
      }

      notifications.show({
        title: "Success",
        message: "Zoom account disconnected successfully",
        color: "green",
      });

      // Refresh status
      await checkZoomStatus();
      onDisconnected?.();
    } catch (error) {
      console.error("Error disconnecting from Zoom:", error);
      notifications.show({
        title: "Error",
        message: "Failed to disconnect from Zoom",
        color: "red",
      });
    }
  };

  // Check status on mount
  useEffect(() => {
    checkZoomStatus();
  }, []);

  if (isLoading) {
    return (
      <Center h={100}>
        <Loader size="sm" />
      </Center>
    );
  }

  if (!zoomStatus) {
    return (
      <Alert color="red" icon={<IconX size={16} />}>
        Failed to load Zoom connection status
      </Alert>
    );
  }

  return (
    <>
      <Stack gap="md">
        {/* Connection Status */}
        <Group justify="space-between">
          <Group gap="xs">
            <IconVideo size={20} />
            <Text fw={500}>Zoom Integration</Text>
          </Group>
          <Badge color={zoomStatus.connected ? "green" : "red"} variant="light">
            {zoomStatus.connected ? "Connected" : "Not Connected"}
          </Badge>
        </Group>

        {/* Status Messages */}
        {zoomStatus.expired && (
          <Alert color="yellow" icon={<IconX size={16} />}>
            Your Zoom connection has expired. Please reconnect to continue
            creating sessions.
          </Alert>
        )}

        {!zoomStatus.connected && !zoomStatus.expired && (
          <Alert color="blue" icon={<IconVideo size={16} />}>
            Connect your Zoom account to create sessions with embedded video
            meetings.
          </Alert>
        )}

        {/* Action Buttons */}
        <Group gap="sm">
          {zoomStatus.connected && !zoomStatus.expired ? (
            <>
              <Button
                color="green"
                leftSection={<IconCheck size={16} />}
                size="sm"
                disabled
              >
                Connected
              </Button>
              <Button
                color="red"
                variant="outline"
                leftSection={<IconX size={16} />}
                onClick={disconnectZoom}
                size="sm"
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              color="blue"
              leftSection={<IconVideo size={16} />}
              onClick={() => setShowConnectModal(true)}
              loading={isConnecting}
              size="sm"
            >
              {zoomStatus.expired ? "Reconnect Zoom" : "Connect Zoom"}
            </Button>
          )}
        </Group>

        {/* Help Text */}
        <Text size="sm" color="dimmed">
          {zoomStatus.connected
            ? "You can now create sessions with embedded Zoom video meetings."
            : "Connect your Zoom account to enable embedded video meetings for your sessions."}
        </Text>
      </Stack>

      {/* Connect Modal */}
      <Modal
        opened={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        title="Connect Zoom Account"
        size="md"
      >
        <Stack gap="md">
          <Text>
            To create sessions with embedded video meetings, you need to connect
            your Zoom account. This will allow us to automatically create Zoom
            meetings for your sessions.
          </Text>

          <Alert color="blue" icon={<IconExternalLink size={16} />}>
            You will be redirected to Zoom to authorize the connection. This is
            a secure process.
          </Alert>

          <Group justify="flex-end" gap="sm">
            <Button
              variant="outline"
              onClick={() => setShowConnectModal(false)}
            >
              Cancel
            </Button>
            <Button
              color="blue"
              leftSection={<IconVideo size={16} />}
              onClick={connectZoom}
              loading={isConnecting}
            >
              Connect to Zoom
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default ZoomConnection;
