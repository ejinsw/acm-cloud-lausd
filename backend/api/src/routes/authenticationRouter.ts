import { Router } from "express";
import {
  signup,
  login,
  verifyEmail,
  resendVerification,
  getUserData,
  logout,
  getActiveTokens,
} from "../controllers/authenticationController";
import { authenticateToken } from "../middleware/auth";
const router = Router();

// Public routes
router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.post("/auth/verify-email", verifyEmail);
router.post("/auth/resend-verification", resendVerification);

// Protected routes
router.get("/auth/me", authenticateToken, getUserData);
router.post("/auth/logout", authenticateToken, logout);
router.get("/auth/tokens", authenticateToken, getActiveTokens);

export default router;
