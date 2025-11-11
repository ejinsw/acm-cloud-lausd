'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Loader, Alert, Button, Text } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import ZoomMtg from '@zoom/meetingsdk';

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

export function ZoomEmbed({ config, containerId = 'zoom-container', onError }: ZoomEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const zoomClientRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !config.signature) {
      console.log('ZoomEmbed: Missing container or signature', { 
        hasContainer: !!containerRef.current, 
        hasSignature: !!config.signature 
      });
      return;
    }

    let zoomClient: any = null;
    let joinTimeout: NodeJS.Timeout | null = null;

    const initZoom = async () => {
      try {
        console.log('ZoomEmbed: Starting initialization...');
        
        // Set up Zoom JS library path
        ZoomMtg.setZoomJSLib('https://source.zoom.us/lib', '/av');
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareWebSDK();

        // Create Zoom client
        zoomClient = ZoomMtg.createClient({
          sdkKey: config.sdkKey,
          sdkSecret: '', // Not needed when using signature
          language: 'en-US',
          zoomAppRoot: containerRef.current || undefined,
          enforceMultipleVideoElements: false,
        });

        console.log('ZoomEmbed: Client created, initializing...');

        // Initialize Zoom
        await zoomClient.init('en-US', 'Global', {
          patchJsMedia: true,
          leaveOnPageUnload: true,
          leaveOnBeforeUnload: true,
        });

        console.log('ZoomEmbed: Initialized, joining meeting...');

        // Set a timeout to prevent infinite loading
        joinTimeout = setTimeout(() => {
          if (loading) {
            console.warn('ZoomEmbed: Join timeout - taking too long');
            setError('Zoom meeting join is taking longer than expected. Please try refreshing.');
            setLoading(false);
          }
        }, 30000); // 30 second timeout

        // Join meeting - wrap in Promise to handle callbacks
        const joinPromise = new Promise<void>((resolve, reject) => {
          zoomClient.join({
            signature: config.signature,
            meetingNumber: config.meetingNumber,
            userName: config.userName || 'User',
            userEmail: config.userEmail || '',
            passWord: config.password || '',
            tk: '',
            zak: '',
            success: (success: any) => {
              console.log('Zoom meeting joined successfully:', success);
              if (joinTimeout) clearTimeout(joinTimeout);
              setLoading(false);
              setError(null);
              resolve();
            },
            error: (err: any) => {
              console.error('Zoom join error:', err);
              if (joinTimeout) clearTimeout(joinTimeout);
              const errorMsg = err.reason || err.message || 'Failed to join Zoom meeting';
              setError(errorMsg);
              setLoading(false);
              if (onError) {
                onError(errorMsg);
              }
              reject(new Error(errorMsg));
            },
          });
        });

        await joinPromise;
        zoomClientRef.current = zoomClient;
      } catch (err: any) {
        console.error('Zoom initialization error:', err);
        if (joinTimeout) clearTimeout(joinTimeout);
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
      if (joinTimeout) {
        clearTimeout(joinTimeout);
      }
      if (zoomClientRef.current) {
        try {
          zoomClientRef.current.leave().catch((err: any) => {
            console.error('Error leaving Zoom meeting:', err);
          });
          zoomClientRef.current = null;
        } catch (err) {
          console.error('Error cleaning up Zoom client:', err);
        }
      }
    };
  }, [config, onError]);

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

  if (loading) {
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

