import express from 'express';
import { connectZoom, zoomCallback, disconnectZoom } from '../controllers/zoomController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Zoom OAuth routes
router.get('/connect', authenticateToken, connectZoom);
router.get('/callback', authenticateToken, zoomCallback);
router.delete('/disconnect', authenticateToken, disconnectZoom);

export default router;
