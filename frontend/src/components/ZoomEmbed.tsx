"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Loader, Alert, Button, Text } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";

interface ZoomSDKConfig {
  meetingNumber: string;
  sdkKey: string;
  signature: string;
  password: string;
  userName: string;
  userEmail: string;
  role: number;
}

interface ZoomEmbedProps {
  config: ZoomSDKConfig;
  containerId?: string;
  onError?: (error: string) => void;
}

export function ZoomEmbed({
  config,
  containerId = "zoom-container",
  onError,
}: ZoomEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const zoomClientRef = useRef<any>(null);
  const isLoadingRef = useRef(true);

  useEffect(() => {
    // Wait for both container and signature to be available
    if (!containerRef.current || !config?.signature) {
      return;
    }

    // Reset loading state
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let zoomClient: any = null;
    let joinTimeout: NodeJS.Timeout | null = null;

    const initZoom = async () => {
      try {
        console.log("ZoomEmbed: Starting initialization...");

        // Dynamically import Zoom SDK Component View to avoid SSR issues
        const ZoomMtgEmbedded = (await import("@zoom/meetingsdk/embedded"))
          .default;

        // Create Zoom client (Component View - no parameters needed)
        zoomClient = ZoomMtgEmbedded.createClient();

        console.log("ZoomEmbed: Client created, initializing...");

        // Initialize Zoom (Component View API - returns Promise)
        await zoomClient.init({
          zoomAppRoot: containerRef.current!,
          language: "en-US",
          patchJsMedia: true,
        });

        console.log("ZoomEmbed: Initialized, joining meeting...");

        // Set a timeout to prevent infinite loading
        joinTimeout = setTimeout(() => {
          if (isLoadingRef.current) {
            console.warn("ZoomEmbed: Join timeout - taking too long");
            setError(
              "Zoom meeting join is taking longer than expected. Please try refreshing."
            );
            setLoading(false);
            isLoadingRef.current = false;
          }
        }, 30000); // 30 second timeout

        // Join meeting (Component View - returns Promise)
        await zoomClient.join({
          signature: config.signature,
          meetingNumber: config.meetingNumber,
          userName: config.userName || "User",
          userEmail: config.userEmail || "",
          password: config.password || "",
          tk: "", // Registrant token if registration required
          zak: "", // Host's ZAK token if starting meeting
        });

        console.log("Zoom meeting joined successfully");
        if (joinTimeout) clearTimeout(joinTimeout);
        isLoadingRef.current = false;
        setLoading(false);
        setError(null);
        zoomClientRef.current = zoomClient;
      } catch (err) {
        console.error("Zoom initialization error:", err);
        if (joinTimeout) clearTimeout(joinTimeout);
        isLoadingRef.current = false;
        const errorMsg =
          err instanceof Error ? err.message : "Failed to initialize Zoom";
        setError(errorMsg);
        setLoading(false);
        if (onError) {
          onError(errorMsg);
        }
      }
    };

    initZoom();

    // Cleanup
    return () => {
      if (joinTimeout) {
        clearTimeout(joinTimeout);
      }
      if (zoomClientRef.current) {
        try {
          // Component View cleanup - leave meeting if joined
          if (
            "leave" in zoomClientRef.current &&
            typeof zoomClientRef.current.leave === "function"
          ) {
            zoomClientRef.current.leave().catch((err: unknown) => {
              console.error("Error leaving Zoom meeting:", err);
            });
          }
          zoomClientRef.current = null;
        } catch (err) {
          console.error("Error cleaning up Zoom client:", err);
        }
      }
    };
  }, [config, onError]);

  if (error) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Zoom Error"
        color="red"
      >
        {error}
        <Button
          mt="md"
          leftSection={<IconRefresh size={16} />}
          onClick={() => {
            setError(null);
            setLoading(true);
            window.location.reload();
          }}
        >
          Retry
        </Button>
      </Alert>
    );
  }

  // Always render the container with ref, conditionally show loader inside
  return (
    <Box
      id={containerId}
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
        position: "relative",
      }}
    >
      {loading && (
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            zIndex: 10,
          }}
        >
          <Loader size="lg" />
          <Text ml="md">Loading Zoom meeting...</Text>
        </Box>
      )}
    </Box>
  );
}
