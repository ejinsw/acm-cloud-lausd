import dotenv from 'dotenv';
dotenv.config();

// Simple Zoom configuration for tutoring app
export const ZOOM_CONFIG = {
  clientId: process.env.ZOOM_CLIENT_ID,
  clientSecret: process.env.ZOOM_CLIENT_SECRET,
  redirectUri: process.env.ZOOM_REDIRECT_URI,
  baseUrl: 'https://api.zoom.us/v2',
  sdkKey: process.env.ZOOM_SDK_KEY,
  sdkSecret: process.env.ZOOM_SDK_SECRET,
};

// Log configuration on startup (mask sensitive data)
console.log('[Zoom Config] Loaded configuration:', {
  clientId: ZOOM_CONFIG.clientId ? `${ZOOM_CONFIG.clientId.substring(0, 10)}...` : '❌ MISSING',
  clientSecret: ZOOM_CONFIG.clientSecret ? '✅ SET' : '❌ MISSING',
  redirectUri: ZOOM_CONFIG.redirectUri || '❌ MISSING',
  sdkKey: ZOOM_CONFIG.sdkKey ? `${ZOOM_CONFIG.sdkKey.substring(0, 10)}...` : '⚠️  NOT SET',
  sdkSecret: ZOOM_CONFIG.sdkSecret ? '✅ SET' : '⚠️  NOT SET',
});

// Zoom API Endpoints
export const ZOOM_ENDPOINTS = {
  OAUTH_AUTHORIZE: 'https://zoom.us/oauth/authorize',
  OAUTH_TOKEN: 'https://zoom.us/oauth/token',
  OAUTH_REVOKE: 'https://zoom.us/oauth/revoke',
} as const;

// Basic types we actually need for tutoring
export interface ZoomMeeting {
  id: number;
  uuid: string;
  topic: string;
  start_time: string;
  duration: number;
  join_url: string;
  start_url: string;
  password: string;
}

// Simple error class
export class ZoomAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'ZoomAPIError';
  }
}
