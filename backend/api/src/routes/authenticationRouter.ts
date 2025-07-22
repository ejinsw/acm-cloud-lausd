import express from 'express';
import {
  signup,
  login,
  verifyEmail,
  resendVerification,
  logout,
  getActiveTokens,
  refreshToken,
  forgotPassword,
  resetPassword,
} from '../controllers/authenticationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.post("/auth/verify-email", verifyEmail);
router.post("/auth/resend-verification", resendVerification);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);

// Protected routes
router.post('/auth/logout', authenticateToken, logout);
router.get('/auth/tokens', authenticateToken, getActiveTokens);
router.post('/auth/refresh-token', refreshToken);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);

export default router;
