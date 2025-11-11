import dotenv from 'dotenv';
dotenv.config();

// Simple Zoom configuration for tutoring app
export const ZOOM_CONFIG = {
  clientId: process.env.ZOOM_CLIENT_ID,
  clientSecret: process.env.ZOOM_CLIENT_SECRET,
  redirectUri: process.env.ZOOM_REDIRECT_URI,
  baseUrl: 'https://api.zoom.us/v2',
  // SDK credentials for embedded Zoom SDK signature generation
  sdkKey: process.env.ZOOM_SDK_KEY,
  sdkSecret: process.env.ZOOM_SDK_SECRET,
};

// Basic types we actually need for tutoring
export interface ZoomMeeting {
  id: number;
  uuid: string;
  topic: string;
  start_time: string;
  duration: number;
  join_url: string;
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
