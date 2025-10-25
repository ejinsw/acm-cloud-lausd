import axios, { AxiosResponse } from 'axios';
import { ZOOM_CONFIG, ZoomMeeting, ZoomAPIError } from '../config/zoom.config';

// Zoom API Service for tutoring app
export class ZoomService {
  private baseURL = ZOOM_CONFIG.baseUrl;
  private accessToken: string | null = null;

  // Get access token (you'll need to implement OAuth flow)
  private async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    // TODO: Implement OAuth token refresh logic
    // For now, you'll need to get this from your OAuth implementation
    throw new Error('Access token not available. Implement OAuth flow first.');
  }

  // Create a new meeting for a tutoring session
  async createMeeting(sessionData: {
    topic: string;
    startTime: string;
    duration: number;
    instructorEmail: string;
  }): Promise<ZoomMeeting> {
    try {
      const token = await this.getAccessToken();

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

      const response: AxiosResponse<ZoomMeeting> = await axios.post(
        `${this.baseURL}/users/${sessionData.instructorEmail}/meetings`,
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
  async getMeeting(meetingId: string): Promise<ZoomMeeting> {
    try {
      const token = await this.getAccessToken();

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

  // Generate SDK token for embedded video (this is key for embedding!)
  async generateSDKToken(
    meetingId: string,
    role: 'host' | 'participant' = 'participant'
  ): Promise<{
    token: string;
    signature: string;
    meetingNumber: string;
    userName: string;
    userEmail: string;
  }> {
    try {
      const token = await this.getAccessToken();

      // Get meeting details first
      const meeting = await this.getMeeting(meetingId);

      // Generate SDK token
      const response = await axios.post(
        `${this.baseURL}/meetings/${meetingId}/token`,
        {
          role: role,
          type: 'sdk',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        token: response.data.token,
        signature: response.data.signature,
        meetingNumber: meeting.id.toString(),
        userName: '', // Will be set by frontend
        userEmail: '', // Will be set by frontend
      };
    } catch (error: any) {
      throw new ZoomAPIError(
        `Failed to generate SDK token: ${error.message}`,
        error.response?.status || 500
      );
    }
  }

  // Update meeting (for rescheduling)
  async updateMeeting(
    meetingId: string,
    updates: {
      topic?: string;
      startTime?: string;
      duration?: number;
    }
  ): Promise<ZoomMeeting> {
    try {
      const token = await this.getAccessToken();

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
  async deleteMeeting(meetingId: string): Promise<void> {
    try {
      const token = await this.getAccessToken();

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
  async getMeetingStatus(meetingId: string): Promise<{
    status: string;
    isActive: boolean;
    startTime?: string;
    endTime?: string;
  }> {
    try {
      const meeting = await this.getMeeting(meetingId);
      const now = new Date();
      const startTime = new Date(meeting.start_time);
      const endTime = new Date(startTime.getTime() + meeting.duration * 60000); // duration in minutes

      return {
        status: meeting.status,
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
