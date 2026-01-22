import { useState, useEffect } from 'react';
import { getToken } from '../actions/authentication';

interface ZoomSDKConfig {
  meetingNumber: string;
  sdkKey: string;
  signature: string;
  password: string;
  userName: string;
  userEmail: string;
  role: number;
}

interface UseZoomSDKReturn {
  config: ZoomSDKConfig | null;
  loading: boolean;
  error: string | null;
  fetchSDKSignature: (queueId: number, userName?: string, userEmail?: string, role?: 'host' | 'participant') => Promise<void>;
}

export function useZoomSDK(): UseZoomSDKReturn {
  const [config, setConfig] = useState<ZoomSDKConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSDKSignature = async (
    queueId: number,
    userName?: string,
    userEmail?: string,
    role: 'host' | 'participant' = 'participant',
    sessionId?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const params = new URLSearchParams({
        role: role,
        ...(userName && { userName }),
        ...(userEmail && { userEmail }),
      });

      // Use sessionId if provided, otherwise use queueId
      const endpoint = sessionId
        ? `${baseUrl}/api/zoom/sdk-signature/session/${sessionId}`
        : `${baseUrl}/api/zoom/sdk-signature/${queueId}`;

      const response = await fetch(
        `${endpoint}?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch SDK signature' }));
        throw new Error(errorData.message || 'Failed to fetch SDK signature');
      }

      const data = await response.json();
      setConfig(data);
    } catch (err: any) {
      console.error('Failed to fetch Zoom SDK signature:', err);
      setError(err.message || 'Failed to fetch SDK signature');
      setConfig(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    config,
    loading,
    error,
    fetchSDKSignature,
  };
}

