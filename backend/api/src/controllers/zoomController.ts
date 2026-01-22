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
 * Start Zoom OAuth flow - Returns OAuth URL for frontend to redirect
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

    console.log('[Zoom Connect] Building OAuth URL with config:', {
      clientId: ZOOM_CONFIG.clientId ? `${ZOOM_CONFIG.clientId.substring(0, 10)}...` : 'MISSING',
      redirectUri: ZOOM_CONFIG.redirectUri || 'MISSING',
      userId: userId
    });

    // Build OAuth URL
    const authUrl = new URL(ZOOM_ENDPOINTS.OAUTH_AUTHORIZE);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', ZOOM_CONFIG.clientId ?? "");
    authUrl.searchParams.set('redirect_uri', ZOOM_CONFIG.redirectUri ?? "");
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', 'meeting:write:meeting meeting:read:meeting user:read:user');

    console.log('[Zoom Connect] Full OAuth URL:', authUrl.toString());
    console.log('[Zoom Connect] Returning Zoom OAuth URL to frontend');
    
    // Return the OAuth URL to the frontend instead of redirecting
    // This allows the frontend to handle the redirect with proper token handling
    res.json({
      authUrl: authUrl.toString(),
      message: 'Zoom OAuth URL generated successfully',
    });
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

    console.log('[Zoom Callback] Received callback with:', {
      hasCode: !!code,
      hasState: !!state,
      code: code ? `${String(code).substring(0, 20)}...` : 'MISSING',
      state: state || 'MISSING'
    });

    if (!code || !state) {
      console.error('[Zoom Callback] Missing required parameters');
      res.status(400).json({ message: 'Missing authorization code or state' });
      return;
    }

    // Extract userId from state parameter
    // State format: {userId}-{timestamp}
    // userId is a UUID with dashes, so we need to extract everything except the last part (timestamp)
    const stateStr = state as string;
    const parts = stateStr.split('-');
    // UUID has 5 parts (8-4-4-4-12), timestamp is the last part
    // So we take all parts except the last one and rejoin with dashes
    const userId = parts.slice(0, -1).join('-');

    console.log('[Zoom Callback] Extracted userId from state:', userId);

    if (!userId) {
      console.error('[Zoom Callback] Invalid state parameter - could not extract userId');
      res.status(400).json({ message: 'Invalid state parameter' });
      return;
    }

    try {
      // First, verify the user exists
      console.log('[Zoom Callback] Looking up user in database with ID:', userId);
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        console.error('[Zoom Callback] ❌ User not found in database with ID:', userId);
        console.error('[Zoom Callback] This means the user ID from the state parameter does not match any user in the database');
        console.error('[Zoom Callback] Possible causes:');
        console.error('[Zoom Callback] 1. User was deleted from database');
        console.error('[Zoom Callback] 2. User ID mismatch between Cognito and Prisma');
        console.error('[Zoom Callback] 3. State parameter was tampered with');
        
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/dashboard/instructor?tab=zoom&error=user_not_found`);
        return;
      }

      console.log('[Zoom Callback] ✅ User found in database:', { id: user.id, email: user.email, role: user.role });
      console.log('[Zoom Callback] Exchanging code for tokens with redirect_uri:', ZOOM_CONFIG.redirectUri);
      
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

      console.log('[Zoom Callback] Successfully received tokens from Zoom');

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

      console.log('[Zoom Callback] Tokens stored in database for user:', userId);

      // Redirect back to the frontend dashboard with success message
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      console.log('[Zoom Callback] Redirecting to frontend:', `${frontendUrl}/dashboard/instructor?tab=zoom&zoom_connected=true`);
      res.redirect(`${frontendUrl}/dashboard/instructor?tab=zoom&zoom_connected=true`);
    } catch (error: any) {
      console.error('[Zoom Callback] Error during token exchange:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
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
