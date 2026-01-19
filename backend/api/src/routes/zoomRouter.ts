import express from 'express';
import { connectZoom, zoomCallback, disconnectZoom, getZoomStatus } from '../controllers/zoomController';
import { authenticateToken } from '../middleware/auth';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

// Optional auth middleware - tries to authenticate but doesn't fail if token is in query
const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  // If token is in query parameter, skip middleware (controller will handle it)
  if (req.query.token) {
    return next();
  }
  // Otherwise, use normal authentication
  return authenticateToken(req, res, next);
};

// Zoom OAuth routes
router.get('/connect', optionalAuth, connectZoom);
router.get('/callback', zoomCallback); // No auth middleware - validates via state parameter
router.get('/status', authenticateToken, getZoomStatus);
router.delete('/disconnect', authenticateToken, disconnectZoom);

export default router;
