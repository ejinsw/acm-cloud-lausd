import express from 'express';
import { getSDKSignature, getMeetingInfo } from '../controllers/zoomController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get SDK signature for embedded Zoom SDK
router.get('/zoom/sdk-signature/:queueId', authenticateToken, getSDKSignature);

// Get Zoom meeting information
router.get('/zoom/meeting-info/:queueId', authenticateToken, getMeetingInfo);

export default router;
