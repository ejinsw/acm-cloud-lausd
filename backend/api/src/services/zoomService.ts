import axios, { AxiosResponse } from 'axios';
import { ZOOM_CONFIG, ZoomMeeting, ZoomAPIError } from '../config/zoom.config';
import { prisma } from '../config/prisma';

// Zoom API Service for tutoring app
export class ZoomService {
  private baseURL = ZOOM_CONFIG.baseUrl;

  // Get access token using General OAuth (from user's stored tokens)
  // This method gets/refreshes tokens for a specific user
  private async getAccessTokenForUser(userId: string): Promise<string> {
    if (!ZOOM_CONFIG.clientId || !ZOOM_CONFIG.clientSecret) {
      throw new Error('Zoom client ID and secret must be configured');
    }

    // Get user's stored tokens
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        zoomAccessToken: true,
        zoomRefreshToken: true,
        zoomTokenExpiry: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if we have a valid access token
    if (user.zoomAccessToken && user.zoomTokenExpiry && user.zoomTokenExpiry > new Date()) {
      return user.zoomAccessToken;
    }

    // Need to refresh token
    if (!user.zoomRefreshToken) {
      throw new Error('Zoom not authorized for this user. Please authorize Zoom first.');
    }

    try {
      // Refresh the access token using refresh token
      const credentials = Buffer.from(
        `${ZOOM_CONFIG.clientId}:${ZOOM_CONFIG.clientSecret}`
      ).toString('base64');

      const response = await axios.post(
        'https://zoom.us/oauth/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: user.zoomRefreshToken,
        }),
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const newAccessToken = response.data.access_token as string;
      const newRefreshToken = (response.data.refresh_token as string) || user.zoomRefreshToken;
      const expiresIn = response.data.expires_in || 3600;
      const expiryDate = new Date(Date.now() + expiresIn * 1000);

      // Update user's tokens in database
      await prisma.user.update({
        where: { id: userId },
        data: {
          zoomAccessToken: newAccessToken,
          zoomRefreshToken: newRefreshToken,
          zoomTokenExpiry: expiryDate,
        },
      });

      return newAccessToken;
    } catch (error: any) {
      throw new ZoomAPIError(
        `Failed to refresh Zoom access token: ${error.message}`,
        error.response?.status || 500
      );
    }
  }

  // Create a new meeting for a tutoring session under the instructor's account
  async createMeeting(sessionData: {
    topic: string;
    startTime: string;
    duration: number;
    instructorId: string; // Use instructor ID instead of email for token lookup
    instructorEmail: string; // Still need email for API endpoint
  }): Promise<ZoomMeeting> {
    try {
      // Get access token for the instructor
      const token = await this.getAccessTokenForUser(sessionData.instructorId);

      const meetingData = {
        topic: sessionData.topic,
        type: 2, // Scheduled meeting
        start_time: sessionData.startTime,
        duration: sessionData.duration,
        timezone: 'America/Los_Angeles', // Adjust for your timezone
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          mute_upon_entry: false,
          waiting_room: false,
          auto_recording: 'none',
          enforce_login: false,
          approval_type: 0, // Automatically approve
        },
      };

      // Create meeting under the instructor's account (using 'me' endpoint)
      const response: AxiosResponse<ZoomMeeting> = await axios.post(
        `${this.baseURL}/users/me/meetings`,
        meetingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new ZoomAPIError(
        `Failed to create Zoom meeting: ${error.message}`,
        error.response?.status || 500
      );
    }
  }

  // Get meeting details (for joining)
  async getMeeting(meetingId: string, userId: string): Promise<ZoomMeeting> {
    try {
      const token = await this.getAccessTokenForUser(userId);

      const response: AxiosResponse<ZoomMeeting> = await axios.get(
        `${this.baseURL}/meetings/${meetingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new ZoomAPIError(
        `Failed to get Zoom meeting: ${error.message}`,
        error.response?.status || 500
      );
    }
  }

  // Generate SDK signature for embedded Zoom SDK
  // This generates the signature needed for Zoom Embedded SDK authentication
  generateSDKSignature(meetingNumber: string, role: number = 0): string {
    if (!ZOOM_CONFIG.sdkKey || !ZOOM_CONFIG.sdkSecret) {
      throw new Error('Zoom SDK key and secret must be configured');
    }

    const crypto = require('crypto');
    const timestamp = Date.now() - 30000; // Current timestamp - 30 seconds
    const msg = Buffer.from(`${ZOOM_CONFIG.sdkKey}${meetingNumber}${timestamp}${role}`).toString(
      'base64'
    );
    const hash = crypto.createHmac('sha256', ZOOM_CONFIG.sdkSecret).update(msg).digest('base64');
    const signature = Buffer.from(
      `${ZOOM_CONFIG.sdkKey}.${meetingNumber}.${timestamp}.${role}.${hash}`
    ).toString('base64');

    return signature;
  }

  // Update meeting (for rescheduling)
  async updateMeeting(
    meetingId: string,
    userId: string,
    updates: {
      topic?: string;
      startTime?: string;
      duration?: number;
    }
  ): Promise<ZoomMeeting> {
    try {
      const token = await this.getAccessTokenForUser(userId);

      const response: AxiosResponse<ZoomMeeting> = await axios.patch(
        `${this.baseURL}/meetings/${meetingId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new ZoomAPIError(
        `Failed to update Zoom meeting: ${error.message}`,
        error.response?.status || 500
      );
    }
  }

  // Delete meeting (for cancelled sessions)
  async deleteMeeting(meetingId: string, userId: string): Promise<void> {
    try {
      const token = await this.getAccessTokenForUser(userId);

      await axios.delete(`${this.baseURL}/meetings/${meetingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      throw new ZoomAPIError(
        `Failed to delete Zoom meeting: ${error.message}`,
        error.response?.status || 500
      );
    }
  }

  // Get meeting status (for checking if session is active)
  async getMeetingStatus(
    meetingId: string,
    userId: string
  ): Promise<{
    status: string;
    isActive: boolean;
    startTime?: string;
    endTime?: string;
  }> {
    try {
      const meeting = await this.getMeeting(meetingId, userId);
      const now = new Date();
      const startTime = new Date(meeting.start_time);
      const endTime = new Date(startTime.getTime() + meeting.duration * 60000); // duration in minutes

      return {
        status: 'waiting', // Zoom API doesn't provide status in meeting object, defaulting to 'waiting'
        isActive: now >= startTime && now <= endTime,
        startTime: meeting.start_time,
        endTime: endTime.toISOString(),
      };
    } catch (error: any) {
      throw new ZoomAPIError(
        `Failed to get meeting status: ${error.message}`,
        error.response?.status || 500
      );
    }
  }
}

// Export singleton instance
export const zoomService = new ZoomService();
