import express from 'express';
import { connectZoom, zoomCallback, disconnectZoom, getZoomStatus } from '../controllers/zoomController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Zoom OAuth routes
router.get('/zoom/connect', authenticateToken, connectZoom); // Returns OAuth URL (doesn't redirect)
router.get('/zoom/callback', zoomCallback); // No auth middleware - validates via state parameter
router.get('/zoom/status', authenticateToken, getZoomStatus);
router.delete('/zoom/disconnect', authenticateToken, disconnectZoom);

export default router;
