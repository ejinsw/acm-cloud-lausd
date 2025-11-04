import express from 'express';
import {
  getSDKSignature,
  getMeetingInfo,
  getSDKSignatureBySession,
} from '../controllers/zoomController';
import { authorizeZoom, zoomOAuthCallback } from '../controllers/zoomAuthController';
import { storeZoomTokens, storeTemporaryZoomTokens, storeZoomTokensFromState } from '../controllers/zoomTokenController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Zoom OAuth endpoints
router.get('/zoom/auth/authorize', authenticateToken, authorizeZoom);
router.get('/zoom/auth/callback', zoomOAuthCallback); // Public - Zoom redirects here

// Store Zoom tokens (used by frontend callback)
router.post('/zoom/tokens/temporary', storeTemporaryZoomTokens); // Public - stores tokens temporarily
router.post('/zoom/tokens/store', authenticateToken, storeZoomTokensFromState); // Private - retrieves and stores permanently
router.put('/zoom/tokens', authenticateToken, storeZoomTokens);

// Get SDK signature for embedded Zoom SDK
router.get('/zoom/sdk-signature/:queueId', authenticateToken, getSDKSignature);
router.get('/zoom/sdk-signature/session/:sessionId', authenticateToken, getSDKSignatureBySession);

// Get Zoom meeting information
router.get('/zoom/meeting-info/:queueId', authenticateToken, getMeetingInfo);

export default router;
