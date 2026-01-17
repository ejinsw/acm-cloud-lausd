import { useState, useEffect, useCallback } from 'react';
import { getToken } from '@/actions/authentication';

export interface ZoomStatus {
  connected: boolean;
  expired: boolean;
  needsReconnect: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useZoomStatus() {
  const [zoomStatus, setZoomStatus] = useState<ZoomStatus>({
    connected: false,
    expired: false,
    needsReconnect: false,
    isLoading: true,
    error: null,
  });

  const checkZoomStatus = useCallback(async () => {
    try {
      setZoomStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/zoom/status`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to check Zoom status');
      }

      const data = await response.json();
      setZoomStatus({
        connected: data.connected,
        expired: data.expired,
        needsReconnect: data.needsReconnect,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error checking Zoom status:', error);
      setZoomStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to check Zoom status',
      }));
    }
  }, []);

  useEffect(() => {
    checkZoomStatus();
  }, [checkZoomStatus]);

  return { ...zoomStatus, refetch: checkZoomStatus };
}
