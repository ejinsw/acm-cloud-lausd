import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// Simple in-memory store for temporary tokens (keyed by state)
// In production, use Redis or similar with TTL
const temporaryTokenStore = new Map<
  string,
  {
    accessToken: string;
    refreshToken?: string;
    expiryDate: Date;
    userId: string;
    timestamp: number;
  }
>();

// Clean up old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    for (const [key, value] of temporaryTokenStore.entries()) {
      if (now - value.timestamp > fiveMinutes) {
        temporaryTokenStore.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

/**
 * @route POST /api/zoom/tokens/temporary
 * @desc Store Zoom OAuth tokens temporarily (keyed by state)
 * @access Public (but state should be validated)
 */
export const storeTemporaryZoomTokens = expressAsyncHandler(async (req: Request, res: Response) => {
  const { state, accessToken, refreshToken, expiryDate, userId } = req.body;

  if (!state || !accessToken || !userId) {
    res.status(400).json({ message: 'State, accessToken, and userId are required' });
    return;
  }

  // Store tokens temporarily (5 minute TTL)
  temporaryTokenStore.set(state, {
    accessToken,
    refreshToken: refreshToken || undefined,
    expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 3600 * 1000),
    userId,
    timestamp: Date.now(),
  });

  res.json({ message: 'Tokens stored temporarily', state });
});

/**
 * @route POST /api/zoom/tokens/store
 * @desc Retrieve temporary tokens by state and store them permanently for authenticated user
 * @access Private
 */
export const storeZoomTokensFromState = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as { sub: string })?.sub;
  if (!userId) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const { state } = req.body;
  if (!state) {
    res.status(400).json({ message: 'State is required' });
    return;
  }

  // Retrieve temporary tokens
  const tempTokens = temporaryTokenStore.get(state);
  if (!tempTokens) {
    res.status(404).json({ message: 'Tokens not found or expired' });
    return;
  }

  // Verify userId matches
  if (tempTokens.userId !== userId) {
    res.status(403).json({ message: 'State does not match authenticated user' });
    return;
  }

  // Check if user exists and is instructor
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  if (user.role !== 'INSTRUCTOR') {
    res.status(403).json({ message: 'Only instructors can store Zoom tokens' });
    return;
  }

  // Store tokens permanently
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        zoomAccessToken: tempTokens.accessToken,
        zoomRefreshToken: tempTokens.refreshToken || null,
        zoomTokenExpiry: tempTokens.expiryDate,
      },
      select: {
        id: true,
        zoomAccessToken: true,
        zoomRefreshToken: true,
        zoomTokenExpiry: true,
      },
    });

    // Clean up temporary storage
    temporaryTokenStore.delete(state);

    if (!updatedUser.zoomAccessToken) {
      res.status(500).json({ message: 'Failed to store access token' });
      return;
    }

    res.json({
      message: 'Zoom tokens stored successfully',
      user: {
        id: updatedUser.id,
        hasAccessToken: !!updatedUser.zoomAccessToken,
        hasRefreshToken: !!updatedUser.zoomRefreshToken,
        tokenExpiry: updatedUser.zoomTokenExpiry,
      },
    });
  } catch (error: any) {
    console.error('Error storing Zoom tokens:', error);
    res.status(500).json({
      message: error.message || 'Failed to store Zoom tokens',
    });
  }
});

/**
 * @route PUT /api/zoom/tokens
 * @desc Store Zoom OAuth tokens for the authenticated user
 * @access Private/Instructor
 */
export const storeZoomTokens = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as { sub: string })?.sub;
  if (!userId) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const { zoomAccessToken, zoomRefreshToken, zoomTokenExpiry } = req.body;

  if (!zoomAccessToken) {
    res.status(400).json({ message: 'Access token is required' });
    return;
  }

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.role !== 'INSTRUCTOR') {
      res.status(403).json({ message: 'Only instructors can store Zoom tokens' });
      return;
    }

    // Update user with Zoom tokens
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        zoomAccessToken,
        zoomRefreshToken: zoomRefreshToken || null,
        zoomTokenExpiry: zoomTokenExpiry ? new Date(zoomTokenExpiry) : null,
      },
      select: {
        id: true,
        zoomAccessToken: true,
        zoomRefreshToken: true,
        zoomTokenExpiry: true,
      },
    });

    // Verify the update succeeded
    if (!updatedUser.zoomAccessToken) {
      res.status(500).json({ message: 'Failed to store access token' });
      return;
    }

    res.json({
      message: 'Zoom tokens stored successfully',
      user: {
        id: updatedUser.id,
        hasAccessToken: !!updatedUser.zoomAccessToken,
        hasRefreshToken: !!updatedUser.zoomRefreshToken,
        tokenExpiry: updatedUser.zoomTokenExpiry,
      },
    });
  } catch (error: any) {
    console.error('Error storing Zoom tokens:', error);
    res.status(500).json({
      message: error.message || 'Failed to store Zoom tokens',
    });
  }
});
