import express from "express";
import {
  signup,
  login,
  verifyEmail,
  resendVerification,
  logout,
  getActiveTokens,
} from "../controllers/authenticationController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Public routes
router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.post("/auth/verify-email", verifyEmail);
router.post("/auth/resend-verification", resendVerification);

// Protected routes
router.post("/auth/logout", authenticateToken, logout);
router.get("/auth/tokens", authenticateToken, getActiveTokens);

export default router;
