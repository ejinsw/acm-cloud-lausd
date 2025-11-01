'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Loader, Alert, Button, Center, Text } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

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

declare global {
  interface Window {
    ZoomMtg: any;
  }
}

export function ZoomEmbed({ config, containerId = 'zoom-container', onError }: ZoomEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    // Load Zoom SDK script
    const loadZoomSDK = () => {
      if (window.ZoomMtg) {
        setSdkLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://source.zoom.us/zoom-meeting-1.9.7.min.js';
      script.async = true;
      script.onload = () => {
        setSdkLoaded(true);
      };
      script.onerror = () => {
        setError('Failed to load Zoom SDK');
        setLoading(false);
        if (onError) {
          onError('Failed to load Zoom SDK');
        }
      };
      document.body.appendChild(script);
    };

    loadZoomSDK();
  }, [onError]);

  useEffect(() => {
    if (!sdkLoaded || !window.ZoomMtg || !containerRef.current) {
      return;
    }

    let zoomClient: any = null;

    const initZoom = async () => {
      try {
        const ZoomMtg = window.ZoomMtg;
        
        // Set up container
        ZoomMtg.setZoomJSLib('https://source.zoom.us/lib', '/av');
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareWebSDK();

        // Initialize Zoom client
        zoomClient = ZoomMtg.createClient({
          sdkKey: config.sdkKey,
          sdkSecret: '', // Not needed when using signature
          language: 'en-US',
          zoomAppRoot: containerRef.current || undefined,
          enforceMultipleVideoElements: false,
        });

        // Initialize Zoom
        await zoomClient.init('en-US', 'Global', {
          patchJsMedia: true,
          leaveOnPageUnload: true,
          leaveOnBeforeUnload: true,
        });

        // Join meeting
        await zoomClient.join({
          signature: config.signature,
          meetingNumber: config.meetingNumber,
          userName: config.userName || 'User',
          userEmail: config.userEmail || '',
          passWord: config.password || '',
          tk: '',
          zak: '',
          success: (success: any) => {
            console.log('Zoom meeting joined successfully:', success);
            setLoading(false);
            setError(null);
          },
          error: (err: any) => {
            console.error('Zoom join error:', err);
            const errorMsg = err.reason || 'Failed to join Zoom meeting';
            setError(errorMsg);
            setLoading(false);
            if (onError) {
              onError(errorMsg);
            }
          },
        });
      } catch (err: any) {
        console.error('Zoom initialization error:', err);
        const errorMsg = err.message || 'Failed to initialize Zoom';
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
      if (zoomClient) {
        try {
          zoomClient.leave().catch((err: any) => {
            console.error('Error leaving Zoom meeting:', err);
          });
        } catch (err) {
          console.error('Error cleaning up Zoom client:', err);
        }
      }
    };
  }, [sdkLoaded, config, onError]);

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Zoom Error" color="red">
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

  if (loading || !sdkLoaded) {
    return (
      <Box h={400} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size="lg" />
        <Text ml="md">Loading Zoom meeting...</Text>
      </Box>
    );
  }

  return (
    <Box id={containerId} ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '400px' }} />
  );
}

