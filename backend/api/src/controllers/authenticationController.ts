import expressAsyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import { getAuth0ManagementClient } from "../config/auth0";

// Request body interfaces
interface SignupBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "student" | "instructor";
  grade?: string; // Optional for students
  subjects?: string[]; // Optional for instructors
}

interface LoginBody {
  email: string;
  password: string;
}

interface VerifyEmailBody {
  code: string;
  email: string;
}

interface ResendVerificationBody {
  email: string;
}

interface ForgotPasswordBody {
  email: string;
}

interface ResetPasswordBody {
  email: string;
  code: string;
  newPassword: string;
}

/**
 * @route POST /api/auth/signup
 * @desc Register a new user on Auth0 and in our database if successful
 * @access Public
 * @body {
 *   email: string;
 *   password: string;
 *   firstName: string;
 *   lastName: string;
 *   role: "student" | "instructor";
 *   grade?: string; // Optional for students
 *   subjects?: string[]; // Optional for instructors
 * }
 */
export const signup = expressAsyncHandler(
  async (req: Request<{}, {}, SignupBody>, res: Response, next: NextFunction) => {
    const { email, password, firstName, lastName, role } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }
    
    // Validate role
    if (role !== 'student' && role !== 'instructor') {
      res.status(500).json({ error: 'Invalid role' });
      return;
    }
    
    // TODO: Implement user registration
    res.status(200).json({ message: 'User registered successfully' });
  }
);

/**
 * @route POST /api/auth/login
 * @desc Login user and return a JWT token
 * @access Public
 * @body {
 *   email: string;
 *   password: string;
 * }
 */
export const login = expressAsyncHandler(
  async (req: Request<{}, {}, LoginBody>, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }
    
    // TODO: Implement user login
    res.status(200).json({ message: 'Login successful' });
  }
);

/**
 * @route POST /api/auth/verify-email
 * @desc Verify user's email on Auth0 and in our database (on verified success)
 * @access Public
 * @body {
 *   code: string;
 *   email: string;
 * }
 */
export const verifyEmail = expressAsyncHandler(
  async (req: Request<{}, {}, VerifyEmailBody>, res: Response, next: NextFunction) => {
    const { code, email } = req.body;
    
    // Validate required fields
    if (!code || !email) {
      res.status(422).json({ error: 'Missing required parameters' });
      return;
    }
    
    // TODO: Implement email verification
    res.status(200).json({ message: 'Email verified successfully' });
  }
);

/**
 * @route POST /api/auth/resend-verification
 * @desc Resend email verification code
 * @access Public
 * @body {
 *   email: string;
 * }
 */
export const resendVerification = expressAsyncHandler(
  async (req: Request<{}, {}, ResendVerificationBody>, res: Response, next: NextFunction) => {
    const { email } = req.body;
    
    // Validate required fields
    if (!email) {
      res.status(422).json({ error: 'Missing email' });
      return;
    }
    
    // TODO: Implement resend verification email
    res.status(200).json({ message: 'Verification email sent' });
  }
);

/**
 * @route POST /api/auth/forgot-password
 * @desc Send password reset email
 * @access Public
 * @body {
 *   email: string;
 * }
 */
export const forgotPassword = expressAsyncHandler(
  async (req: Request<{}, {}, ForgotPasswordBody>, res: Response, next: NextFunction) => {
    const { email } = req.body;
    
    // Validate required fields
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    
    // TODO: Implement forgot password
    res.status(200).json({ message: 'Password reset email sent' });
  }
);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with code
 * @access Public
 * @body {
 *   email: string;
 *   code: string;
 *   newPassword: string;
 * }
 */
export const resetPassword = expressAsyncHandler(
  async (req: Request<{}, {}, ResetPasswordBody>, res: Response, next: NextFunction) => {
    const { email, code, newPassword } = req.body;
    
    // Validate required fields
    if (!email || !code || !newPassword) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }
    
    // TODO: Implement password reset
    res.status(200).json({ message: 'Password reset successfully' });
  }
);

/**
 * @route GET /api/auth/me
 * @desc Get user data from database
 * @access Private
 * @header Authorization: Bearer <token>
 */
export const getUserData = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implement get user data
  }
);

/**
 * @route POST /api/auth/logout
 * @desc Logout user from Auth0
 * @access Private
 * @header Authorization: Bearer <token>
 */
export const logout = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implement user logout
  }
);

/**
 * @route GET /api/auth/tokens
 * @desc Get all active tokens for a user from Auth0
 * @access Private
 * @header Authorization: Bearer <token>
 */
export const getActiveTokens = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implement get active tokens
  }
);