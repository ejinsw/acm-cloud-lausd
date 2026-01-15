import express from 'express';
import { connectZoom, zoomCallback, disconnectZoom, getZoomStatus } from '../controllers/zoomController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Zoom OAuth routes
router.get('/connect', authenticateToken, connectZoom);
router.get('/callback', authenticateToken, zoomCallback);
router.get('/status', authenticateToken, getZoomStatus);
router.delete('/disconnect', authenticateToken, disconnectZoom);

export default router;
