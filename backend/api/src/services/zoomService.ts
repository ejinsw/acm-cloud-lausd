import axios, { AxiosResponse } from 'axios';
import { ZOOM_CONFIG, ZoomMeeting, ZoomAPIError } from '../config/zoom.config';

// Zoom API Service for tutoring app
export class ZoomService {
  private baseURL = ZOOM_CONFIG.baseUrl;

  // Create a new meeting for a tutoring session
  async createMeeting(
    accessToken: string,
    sessionData: {
      topic: string;
      startTime: string;
      duration: number;
      instructorEmail: string;
    }
  ): Promise<ZoomMeeting> {
    try {
      console.log('[ZoomService] Creating meeting with topic:', sessionData.topic);

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
        `${this.baseURL}/users/me/meetings`,
        meetingData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('[ZoomService] Meeting created successfully:', response.data.id);
      return response.data;
    } catch (error: any) {
      console.error('[ZoomService] Failed to create meeting:', error.response?.data || error.message);
      throw new ZoomAPIError(
        `Failed to create Zoom meeting: ${error.response?.data?.message || error.message}`,
        error.response?.status || 500
      );
    }
  }

  // Get meeting details (for joining)
  async getMeeting(accessToken: string, meetingId: string): Promise<ZoomMeeting> {
    try {

      const response: AxiosResponse<ZoomMeeting> = await axios.get(
        `${this.baseURL}/meetings/${meetingId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
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
    accessToken: string,
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
      // Get meeting details first
      const meeting = await this.getMeeting(accessToken, meetingId);

      // Generate SDK token
      const response = await axios.post(
        `${this.baseURL}/meetings/${meetingId}/token`,
        {
          role: role,
          type: 'sdk',
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
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
    accessToken: string,
    meetingId: string,
    updates: {
      topic?: string;
      startTime?: string;
      duration?: number;
    }
  ): Promise<ZoomMeeting> {
    try {

      const response: AxiosResponse<ZoomMeeting> = await axios.patch(
        `${this.baseURL}/meetings/${meetingId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
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
  async deleteMeeting(accessToken: string, meetingId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/meetings/${meetingId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error: any) {
      throw new ZoomAPIError(
        `Failed to delete Zoom meeting: ${error.message}`,
        error.response?.status || 500
      );
    }
  }
}

// Export singleton instance
export const zoomService = new ZoomService();
