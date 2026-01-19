import expressAsyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { ZOOM_CONFIG, ZOOM_ENDPOINTS } from '../config/zoom.config';
import { prisma } from '../config/prisma';
import axios from 'axios';

// Extend Express Request type for session
declare global {
  namespace Express {
    interface Request {
      session?: {
        zoomOAuthState?: string;
      };
    }
  }
}

/**
 * Start Zoom OAuth flow
 * @route GET /zoom/connect
 * @access Private/Instructor
 */
export const connectZoom = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as { sub: string })?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // Check if user is an instructor
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true },
    });

    if (!user || user.role !== 'INSTRUCTOR') {
      res.status(403).json({ message: 'Only instructors can connect Zoom' });
      return;
    }

    // Generate state parameter for security - include userId for validation
    const state = `${userId}-${Date.now()}`;

    // Build OAuth URL
    const authUrl = new URL(ZOOM_ENDPOINTS.OAUTH_AUTHORIZE);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', ZOOM_CONFIG.clientId ?? "");
    authUrl.searchParams.set('redirect_uri', ZOOM_CONFIG.redirectUri ?? "");
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', 'meeting:write meeting:read user:read');

    res.redirect(authUrl.toString());
  }
);

/**
 * Handle Zoom OAuth callback
 * @route GET /zoom/callback
 * @access Public (validates via state parameter)
 */
export const zoomCallback = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code, state } = req.query;

    if (!code || !state) {
      res.status(400).json({ message: 'Missing authorization code or state' });
      return;
    }

    // Extract userId from state parameter
    const stateStr = state as string;
    const userId = stateStr.split('-')[0];

    if (!userId) {
      res.status(400).json({ message: 'Invalid state parameter' });
      return;
    }

    try {
      // Exchange code for tokens
      const tokenResponse = await axios.post(
        ZOOM_ENDPOINTS.OAUTH_TOKEN,
        {
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: ZOOM_CONFIG.redirectUri,
        },
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${ZOOM_CONFIG.clientId}:${ZOOM_CONFIG.clientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      // Store tokens in database
      await prisma.user.update({
        where: { id: userId },
        data: {
          zoomAccessToken: access_token,
          zoomRefreshToken: refresh_token,
          zoomTokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        },
      });

      // Redirect back to the frontend dashboard with success message
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/dashboard/instructor?tab=zoom&zoom_connected=true`);
    } catch (error: any) {
      console.error('Zoom OAuth error:', error.response?.data || error.message);
      res.status(400).json({
        message: 'Failed to connect Zoom account',
        error: error.response?.data || error.message,
      });
    }
  }
);

/**
 * Get Zoom connection status
 * @route GET /zoom/status
 * @access Private/Instructor
 */
export const getZoomStatus = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as { sub: string })?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // Check if user is an instructor
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        role: true,
        zoomAccessToken: true,
        zoomTokenExpiresAt: true,
      },
    });

    if (!user || user.role !== 'INSTRUCTOR') {
      res.status(403).json({ message: 'Only instructors can check Zoom status' });
      return;
    }

    const hasToken = !!user.zoomAccessToken;
    const isExpired = user.zoomTokenExpiresAt ? new Date() >= user.zoomTokenExpiresAt : true;

    res.json({
      connected: hasToken && !isExpired,
      expired: hasToken && isExpired,
      needsReconnect: hasToken && isExpired,
    });
  }
);

/**
 * Disconnect Zoom account
 * @route DELETE /zoom/disconnect
 * @access Private/Instructor
 */
export const disconnectZoom = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as { sub: string })?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // Check if user is an instructor
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'INSTRUCTOR') {
      res.status(403).json({ message: 'Only instructors can disconnect Zoom' });
      return;
    }

    // Clear Zoom tokens from database
    await prisma.user.update({
      where: { id: userId },
      data: {
        zoomAccessToken: null,
        zoomRefreshToken: null,
        zoomTokenExpiresAt: null,
      },
    });

    res.json({
      message: 'Zoom account disconnected successfully',
      connected: false,
    });
  }
);
