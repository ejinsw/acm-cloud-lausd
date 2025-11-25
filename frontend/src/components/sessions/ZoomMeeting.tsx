"use client";

import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Stack, Text, Alert, Loader, Center } from "@mantine/core";
import { IconVideo, IconX } from "@tabler/icons-react";
import { ZoomMtg } from "@zoom/meetingsdk";

interface ZoomMeetingProps {
  sessionId: string;
  userName: string;
  userEmail: string;
  onMeetingEnd?: () => void;
  onError?: (error: string) => void;
}

interface ZoomSDKData {
  token: string;
  signature: string;
  meetingNumber: string;
  userName: string;
  userEmail: string;
}

const ZoomMeeting: React.FC<ZoomMeetingProps> = ({
  sessionId,
  userName,
  userEmail,
  onMeetingEnd,
  onError,
}) => {
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMeetingStarted, setIsMeetingStarted] = useState(false);
  const [sdkData, setSdkData] = useState<ZoomSDKData | null>(null);

  // Fetch Zoom SDK token from backend
  const fetchZoomToken = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${sessionId}/zoom-token`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get Zoom token");
      }

      const data = await response.json();
      setSdkData(data.sdkData);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to initialize Zoom meeting";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize Zoom meeting
  const initializeZoomMeeting = async () => {
    if (!sdkData || !zoomContainerRef.current) return;

    try {
      // Configure Zoom SDK
      ZoomMtg.setZoomJSLib("https://source.zoom.us/2.18.0/lib", "/av");
      ZoomMtg.preLoadWasm();
      ZoomMtg.prepareWebSDK();
      ZoomMtg.prepareJssdk();

      // Initialize the meeting
      ZoomMtg.init({
        leaveOnPageUnload: true,
        isSupportAV: true,
        success: () => {
          console.log("Zoom SDK initialized successfully");
          joinMeeting();
        },
        error: (err: any) => {
          console.error("Zoom SDK initialization failed:", err);
          setError("Failed to initialize Zoom meeting");
          onError?.("Failed to initialize Zoom meeting");
        },
      });

      // Configure meeting settings
      ZoomMtg.join({
        signature: sdkData.signature,
        meetingNumber: sdkData.meetingNumber,
        userName: sdkData.userName,
        userEmail: sdkData.userEmail,
        passWord: "", // No password needed for SDK meetings
        success: () => {
          console.log("Successfully joined Zoom meeting");
          setIsMeetingStarted(true);
        },
        error: (err: any) => {
          console.error("Failed to join Zoom meeting:", err);
          setError("Failed to join Zoom meeting");
          onError?.("Failed to join Zoom meeting");
        },
      });
    } catch (err) {
      console.error("Error initializing Zoom meeting:", err);
      setError("Failed to initialize Zoom meeting");
      onError?.("Failed to initialize Zoom meeting");
    }
  };

  // Join the meeting
  const joinMeeting = () => {
    if (!zoomContainerRef.current) return;

    // Mount the Zoom meeting to the container
    ZoomMtg.inMeetingServiceListener("onUserJoin", (data: any) => {
      console.log("User joined:", data);
    });

    ZoomMtg.inMeetingServiceListener("onUserLeave", (data: any) => {
      console.log("User left:", data);
    });

    ZoomMtg.inMeetingServiceListener("onMeetingStatus", (data: any) => {
      console.log("Meeting status:", data);
      if (data.meetingStatus === 3) {
        // Meeting ended
        onMeetingEnd?.();
      }
    });

    // Mount the meeting
    ZoomMtg.mount(zoomContainerRef.current);
  };

  // Leave meeting
  const leaveMeeting = () => {
    ZoomMtg.leaveMeeting({
      success: () => {
        console.log("Successfully left meeting");
        onMeetingEnd?.();
      },
      error: (err: any) => {
        console.error("Error leaving meeting:", err);
      },
    });
  };

  // Initialize on mount
  useEffect(() => {
    fetchZoomToken();
  }, [sessionId]);

  // Initialize meeting when SDK data is available
  useEffect(() => {
    if (sdkData && !isMeetingStarted) {
      initializeZoomMeeting();
    }
  }, [sdkData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isMeetingStarted) {
        ZoomMtg.leaveMeeting({
          success: () => console.log("Cleaned up meeting"),
          error: (err: any) => console.error("Error during cleanup:", err),
        });
      }
    };
  }, [isMeetingStarted]);

  if (isLoading) {
    return (
      <Box
        h={400}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack align="center" spacing="md">
          <Loader size="lg" />
          <Text>Initializing Zoom meeting...</Text>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        h={400}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Alert
          color="red"
          icon={<IconX size={16} />}
          title="Zoom Meeting Error"
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box h={600} style={{ position: "relative" }}>
      {/* Zoom Meeting Container */}
      <Box
        ref={zoomContainerRef}
        h="100%"
        style={{
          backgroundColor: "#1a1a1a",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      />

      {/* Meeting Controls */}
      {isMeetingStarted && (
        <Box
          style={{
            position: "absolute",
            bottom: "16px",
            right: "16px",
            zIndex: 1000,
          }}
        >
          <Button
            color="red"
            leftIcon={<IconX size={16} />}
            onClick={leaveMeeting}
            size="sm"
          >
            Leave Meeting
          </Button>
        </Box>
      )}

      {/* Meeting Info */}
      <Box
        style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          zIndex: 1000,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: "8px 12px",
          borderRadius: "4px",
          color: "white",
        }}
      >
        <Text size="sm" weight={500}>
          {userName} • {userEmail}
        </Text>
      </Box>
    </Box>
  );
};

export default ZoomMeeting;
