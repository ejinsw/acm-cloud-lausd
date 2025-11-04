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
  console.log('========================================');
  console.log('Zoom OAuth callback - Request received');
  console.log('Zoom OAuth callback - Method:', req.method);
  console.log('Zoom OAuth callback - URL:', req.url);
  console.log('Zoom OAuth callback - Query params:', req.query);
  console.log('Zoom OAuth callback - Headers:', {
    'user-agent': req.headers['user-agent'],
    referer: req.headers.referer,
  });
  console.log('========================================');
  const { code, state } = req.query;

  if (!code) {
    console.error('Zoom OAuth callback - No code provided');
    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile?error=${encodeURIComponent('Authorization code not provided')}`
    );
    return;
  }

  if (!ZOOM_CONFIG.clientId || !ZOOM_CONFIG.clientSecret || !ZOOM_CONFIG.redirectUri) {
    console.error('Zoom OAuth callback - Missing config:', {
      hasClientId: !!ZOOM_CONFIG.clientId,
      hasClientSecret: !!ZOOM_CONFIG.clientSecret,
      hasRedirectUri: !!ZOOM_CONFIG.redirectUri,
    });
    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile?error=${encodeURIComponent('Zoom OAuth not configured properly')}`
    );
    return;
  }

  try {
    // Extract userId from state (basic validation - in production use proper session/state validation)
    // State format: `${userId}-${timestamp}` (base64 encoded)
    // For UUIDs with dashes, need to split on last dash (before timestamp)
    let userId: string | null = null;
    console.log('Zoom OAuth callback - Received state:', state);
    if (state) {
      try {
        const decoded = Buffer.from(state as string, 'base64').toString();
        console.log('Zoom OAuth callback - Decoded state:', decoded);
        // Split on last dash to separate userId from timestamp
        // For UUID format: "6939d92e-d071-700a-743d-0bfc6f7a8955-1762227584810"
        const lastDashIndex = decoded.lastIndexOf('-');
        if (lastDashIndex > 0) {
          userId = decoded.substring(0, lastDashIndex);
          const timestamp = decoded.substring(lastDashIndex + 1);
          console.log('Zoom OAuth callback - Extracted userId:', userId);
          console.log('Zoom OAuth callback - Extracted timestamp:', timestamp);
        } else {
          console.error('Zoom OAuth callback - Invalid state format (no dash found)');
        }
      } catch (e) {
        console.error('Failed to decode state:', e);
      }
    }

    if (!userId) {
      console.error('Zoom OAuth callback - No userId extracted from state');
      // If state validation fails, we can't proceed - redirect to error page
      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile?error=invalid_state`
      );
      return;
    }

    // Check if user exists before proceeding
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      console.error(`Zoom OAuth callback - User ${userId} not found`);
      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile?error=user_not_found`
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

    // Log full token response for debugging
    console.log(
      'Zoom OAuth callback - Token response:',
      JSON.stringify(tokenResponse.data, null, 2)
    );

    const accessToken = tokenResponse.data.access_token;
    const refreshToken = tokenResponse.data.refresh_token;
    const expiresIn = tokenResponse.data.expires_in || 3600;
    const expiryDate = new Date(Date.now() + expiresIn * 1000);

    // Validate access token exists
    if (!accessToken) {
      console.error('Zoom OAuth callback - Access token not received from Zoom');
      throw new Error('Access token not received from Zoom');
    }

    console.log('Zoom OAuth callback - Storing tokens for userId:', userId);
    console.log('Zoom OAuth callback - Access token length:', accessToken?.length || 0);
    console.log('Zoom OAuth callback - Refresh token length:', refreshToken?.length || 0);

    // Store tokens in user's database record
    let updatedUser;
    try {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          zoomAccessToken: accessToken,
          zoomRefreshToken: refreshToken,
          zoomTokenExpiry: expiryDate,
        },
      });
      console.log('Zoom OAuth callback - Database update completed');
    } catch (dbError: any) {
      console.error('Zoom OAuth callback - Database update failed:', dbError);
      console.error('Zoom OAuth callback - Error details:', {
        message: dbError.message,
        code: dbError.code,
        meta: dbError.meta,
      });
      throw new Error(`Database update failed: ${dbError.message}`);
    }

    // Verify the database update succeeded
    if (!updatedUser.zoomAccessToken) {
      console.error('Zoom OAuth callback - Access token not found after update');
      console.error('Zoom OAuth callback - Updated user:', {
        id: updatedUser.id,
        hasAccessToken: !!updatedUser.zoomAccessToken,
        hasRefreshToken: !!updatedUser.zoomRefreshToken,
        hasExpiry: !!updatedUser.zoomTokenExpiry,
      });
      throw new Error('Failed to store access token in database');
    }

    console.log('Zoom OAuth callback - Tokens stored successfully for user:', updatedUser.id);
    console.log('Zoom OAuth callback - Has refresh token:', !!updatedUser.zoomRefreshToken);
    console.log('Zoom OAuth callback - Token expiry:', updatedUser.zoomTokenExpiry);

    // Redirect to success page
    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile?zoom_auth=success`
    );
  } catch (error: any) {
    console.error('Zoom OAuth callback error:', error);
    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile?error=${encodeURIComponent(error.message || 'oauth_failed')}`
    );
  }
});
