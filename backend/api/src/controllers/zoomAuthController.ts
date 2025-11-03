import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { ZOOM_CONFIG } from '../config/zoom.config';
import axios from 'axios';

/**
 * @route GET /api/zoom/auth/authorize
 * @desc Initiate Zoom OAuth authorization flow for instructor
 * @access Private/Instructor
 */
export const authorizeZoom = expressAsyncHandler(async (req: Request, res: Response) => {
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
    res.status(403).json({ message: 'Only instructors can authorize Zoom' });
    return;
  }

  if (!ZOOM_CONFIG.clientId || !ZOOM_CONFIG.redirectUri) {
    res.status(500).json({ message: 'Zoom OAuth not configured properly' });
    return;
  }

  // Generate state to prevent CSRF attacks
  const state = Buffer.from(`${userId}-${Date.now()}`).toString('base64');

  // Store state in session or return it to client to validate on callback
  // For simplicity, we'll include it in the redirect URL and validate it

  // Build Zoom OAuth authorization URL
  const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${ZOOM_CONFIG.clientId}&redirect_uri=${encodeURIComponent(ZOOM_CONFIG.redirectUri!)}&state=${state}`;

  res.status(200).json({
    authUrl: authUrl,
    state: state,
  });
});

/**
 * @route GET /api/zoom/auth/callback
 * @desc Handle Zoom OAuth callback and store tokens
 * @access Public (Zoom redirects here)
 */
export const zoomOAuthCallback = expressAsyncHandler(async (req: Request, res: Response) => {
  const { code, state } = req.query;

  if (!code) {
    res.status(400).json({ message: 'Authorization code not provided' });
    return;
  }

  if (!ZOOM_CONFIG.clientId || !ZOOM_CONFIG.clientSecret || !ZOOM_CONFIG.redirectUri) {
    res.status(500).json({ message: 'Zoom OAuth not configured properly' });
    return;
  }

  try {
    // Extract userId from state (basic validation - in production use proper session/state validation)
    let userId: string | null = null;
    console.log('Zoom OAuth callback - Received state:', state);
    if (state) {
      try {
        const decoded = Buffer.from(state as string, 'base64').toString();
        console.log('Zoom OAuth callback - Decoded state:', decoded);
        userId = decoded.split('-')[0];
        console.log('Zoom OAuth callback - Extracted userId:', userId);
      } catch (e) {
        console.error('Failed to decode state:', e);
      }
    }

    if (!userId) {
      console.error('Zoom OAuth callback - No userId extracted from state');
      // If state validation fails, we can't proceed - redirect to error page
      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings?error=invalid_state`
      );
      return;
    }

    // Exchange authorization code for access token
    const credentials = Buffer.from(`${ZOOM_CONFIG.clientId}:${ZOOM_CONFIG.clientSecret}`).toString(
      'base64'
    );

    const tokenResponse = await axios.post(
      'https://zoom.us/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: ZOOM_CONFIG.redirectUri!,
      }),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    const refreshToken = tokenResponse.data.refresh_token;
    const expiresIn = tokenResponse.data.expires_in || 3600;
    const expiryDate = new Date(Date.now() + expiresIn * 1000);

    console.log('Zoom OAuth callback - Storing tokens for userId:', userId);
    console.log('Zoom OAuth callback - Access token length:', accessToken?.length || 0);
    console.log('Zoom OAuth callback - Refresh token length:', refreshToken?.length || 0);

    // Store tokens in user's database record
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        zoomAccessToken: accessToken,
        zoomRefreshToken: refreshToken,
        zoomTokenExpiry: expiryDate,
      },
    });

    console.log('Zoom OAuth callback - Tokens stored successfully for user:', updatedUser.id);
    console.log('Zoom OAuth callback - Has refresh token:', !!updatedUser.zoomRefreshToken);

    // Redirect to success page
    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings?zoom_auth=success`
    );
  } catch (error: any) {
    console.error('Zoom OAuth callback error:', error);
    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings?error=${encodeURIComponent(error.message || 'oauth_failed')}`
    );
  }
});
