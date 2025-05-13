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
    // TODO: Implement user registration
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
    // TODO: Implement user login
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
    // TODO: Implement email verification
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
    // TODO: Implement resend verification email
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