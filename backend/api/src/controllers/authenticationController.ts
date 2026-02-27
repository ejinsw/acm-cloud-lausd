import expressAsyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { cognito } from '../lib/cognitoSDK';
import {
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
  GlobalSignOutCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  AdminDeleteUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { prisma } from '../config/prisma';
import crypto from 'crypto';
import { getSettingsData, normalizeStringList } from '../services/settingsService';
import { storageService } from '../services/storageService';
import type { UploadedFile } from '../middleware/upload';
// Request body interfaces
interface SignupBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor';
  street: string;
  apartment: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  schoolName: string;
  birthdate: Date;
  grade?: string; // Optional for students
  subjects?: string[] | string; // Optional for instructors
  parentEmail?: string;
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
 * Generates a Cognito Secret Hash
 */
const generateSecretHash = (username: string, clientId: string, clientSecret: string) => {
  return crypto
    .createHmac('sha256', clientSecret)
    .update(username + clientId)
    .digest('base64');
};

const parseSubjectsInput = (rawSubjects: SignupBody['subjects']) => {
  if (Array.isArray(rawSubjects)) {
    return rawSubjects;
  }

  if (typeof rawSubjects === 'string') {
    try {
      const parsed = JSON.parse(rawSubjects);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return rawSubjects
        .split(',')
        .map(value => value.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const getVerificationFiles = (req: Request): UploadedFile[] => {
  const files = (req as Request & { uploadedFiles?: UploadedFile[] }).uploadedFiles;
  if (!files || !Array.isArray(files)) {
    return [];
  }

  return files;
};
/**
 * @route POST /api/auth/signup
 * @desc Register a new user on Auth0 and in our database if successful
 * @access Public
 * @body {
 *   email: string;
 *   password: string;
 *   firstName: string;
 *   lastName: string;
 *   date; Date;
 *   role: "student" | "instructor";
 *   grade?: string; // Optional for students
 *   subjects?: string[]; // Optional for instructors
 * }
 */
export const signup = expressAsyncHandler(
  async (req: Request<{}, {}, SignupBody>, res: Response, next: NextFunction) => {
    const {
      firstName,
      lastName,
      role,
      grade,
      subjects,
      password,
      email,
      parentEmail,
      birthdate,
      street,
      apartment,
      city,
      state,
      zip,
      country,
      schoolName,
    } = req.body;
    const verificationFiles = getVerificationFiles(req);
    const normalizedRole = typeof role === 'string' ? role.toLowerCase() : '';
    const parsedSubjects = parseSubjectsInput(subjects);

    if (!firstName || !lastName || !email || !password || !birthdate || !schoolName || !normalizedRole) {
      res.status(400).json({
        error: 'Email, first name, last name, password, birthdate, and schoolName are required.',
      });
      return;
    }

    if (normalizedRole !== 'student' && normalizedRole !== 'instructor') {
      res.status(400).json({ error: `Invalid role: ${role}` });
      return;
    }

    if (verificationFiles.length > 0 && !storageService.isConfigured()) {
      res.status(500).json({
        error: 'Document uploads are temporarily unavailable. Please try again later.',
      });
      return;
    }

    let cognitoUserSub: string | undefined = undefined;
    let cognitoUserCreated = false;
    const uploadedDocumentKeys: string[] = [];

    try {
      // Start database transaction
      await prisma.$transaction(async (tx) => {
        // Step 1: Create user in Cognito
        const hash = generateSecretHash(
          email,
          process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
          process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET!
        );

        console.log('Attempting to create user with email:', email);

        const command = new SignUpCommand({
          ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
          SecretHash: hash,
          Username: email,
          Password: password,
          UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'custom:role', Value: normalizedRole.toUpperCase() },
          ],
        });

        console.log('Creating user in Cognito...');
        const response = await cognito.send(command);

        if (!response.UserSub) {
          throw new Error('Failed to create Cognito user - no user sub returned');
        }

        const createdUserSub = response.UserSub;
        cognitoUserSub = createdUserSub;
        cognitoUserCreated = true;
        console.log('Successfully created Cognito user with sub:', cognitoUserSub);

        // Step 2: Create user in PostgreSQL database
        if (normalizedRole === 'student') {
          console.log('Creating student in database...');
          await tx.user.create({
            data: {
              id: createdUserSub,
              firstName: firstName,
              lastName: lastName,
              grade: grade,
              email: email,
              birthdate: new Date(birthdate).toISOString(),
              parentEmail: parentEmail,
              street: street,
              apartment: apartment,
              city: city,
              state: state,
              zip: zip,
              country: country,
              schoolName: schoolName,
              role: 'STUDENT',
            },
          });
          console.log('Successfully created student in database');
        } else if (normalizedRole === 'instructor') {
          console.log('Creating instructor in database...');

          const normalizedSubjects = normalizeStringList(parsedSubjects);
          if (normalizedSubjects.length === 0) {
            throw new Error('Instructors must have at least one credentialed subject');
          }

          const settings = await getSettingsData(tx);
          if (!settings) {
            throw new Error('Settings not initialized');
          }

          const allowedSubjects = new Set(settings.subjects);
          const missingSubjects = normalizedSubjects.filter(name => !allowedSubjects.has(name));
          if (missingSubjects.length > 0) {
            throw new Error(`Subjects not found: ${missingSubjects.join(', ')}`);
          }

          await tx.user.create({
            data: {
              id: createdUserSub,
              firstName: firstName,
              lastName: lastName,
              email: email,
              birthdate: new Date(birthdate).toISOString(),
              street: street,
              apartment: apartment,
              city: city,
              state: state,
              zip: zip,
              country: country,
              schoolName: schoolName,
              subjects: normalizedSubjects,
              role: 'INSTRUCTOR',
              instructorReviewStatus: 'UNDER_REVIEW',
            },
          });

          if (verificationFiles.length > 0) {
            const storedDocs = [];
            for (const file of verificationFiles) {
              const stored = await storageService.uploadInstructorVerificationDocument(createdUserSub, file);
              uploadedDocumentKeys.push(stored.s3Key);
              storedDocs.push(stored);
            }

            await tx.instructorVerificationDocument.createMany({
              data: storedDocs.map(doc => ({
                userId: createdUserSub,
                s3Key: doc.s3Key,
                fileName: doc.fileName,
                contentType: doc.contentType,
                sizeBytes: doc.sizeBytes,
              })),
            });
          }

          console.log('Successfully created instructor in database');
        } else {
          throw new Error(`Invalid role: ${normalizedRole}`);
        }

        console.log('Transaction completed successfully');
      });

      // If we reach here, both Cognito and database operations succeeded
      res.status(201).json({ 
        message: 'Signup successful', 
        userSub: cognitoUserSub,
        role: normalizedRole 
      });

    } catch (error: any) {
      console.error('Signup error:', error);

      if (uploadedDocumentKeys.length > 0) {
        await Promise.all(
          uploadedDocumentKeys.map(async key => {
            try {
              await storageService.deleteDocument(key);
            } catch (cleanupError) {
              console.error('Failed to cleanup uploaded document:', cleanupError);
            }
          })
        );
      }

      // If Cognito user was created but database failed, clean up Cognito user
      if (cognitoUserCreated && cognitoUserSub) {
        try {
          console.log('Cleaning up Cognito user due to database failure...');
          const deleteCommand = new AdminDeleteUserCommand({
            UserPoolId: process.env.COGNITO_USER_POOL_ID!,
            Username: email,
          });
          await cognito.send(deleteCommand);
          console.log('Successfully cleaned up Cognito user');
        } catch (cleanupError) {
          console.error('Failed to cleanup Cognito user:', cleanupError);
          // Log but don't fail the response - this is a cleanup error
        }
      }

      // Handle specific error types
      if (error.name === 'UsernameExistsException') {
        res.status(409).json({
          error: 'A user with this email already exists. Please try signing in instead.',
          code: 'USER_EXISTS',
        });
        return;
      }

      if (error.message?.includes('Subjects not found')) {
        res.status(400).json({ 
          error: error.message,
          code: 'INVALID_SUBJECTS'
        });
        return;
      }

      if (error.message?.includes('Settings not initialized')) {
        res.status(400).json({
          error: 'Settings are not initialized. Ask an admin to initialize settings first.',
          code: 'SETTINGS_NOT_INITIALIZED',
        });
        return;
      }

      res.status(500).json({ 
        error: 'Internal server error during signup',
        details: error.message 
      });
    }
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
    if (!email || !password) {
      res.status(400).json('Email and password is required');
      return;
    }
    try {
      const hash = generateSecretHash(
        email,
        process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET!
      );

      const command = new InitiateAuthCommand({
        ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
          SECRET_HASH: hash,
        },
      });

      console.log('Sending command to cognito...');
      const response = await cognito.send(command);
      console.log('Cognito response:', response);

      if (!response.AuthenticationResult) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      //get role
      await prisma.user.findFirst();
      res.json({
        email: email,
        idToken: response.AuthenticationResult.IdToken,
        accessToken: response.AuthenticationResult.AccessToken,
        refreshToken: response.AuthenticationResult.RefreshToken,
      });
    } catch (err: any) {
      if (err.name === 'UserNotConfirmedException') {
        res.status(403).json({ message: 'User is not confirmed', needsConfirmation: true });
        return;
      }
      console.error('Error logging in:', err);
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * @route POST /api/auth/verify-email
 * @desc Verify user's email on Cognito and in our database (on verified success)
 * @access Public
 * @body {
 *   code: string;
 *   email: string;
 * }
 */
export const verifyEmail = expressAsyncHandler(
  async (req: Request<{}, {}, VerifyEmailBody>, res: Response, next: NextFunction) => {
    const { email, code } = req.body;
    if (!email || !code) {
      res.status(422).json({ message: 'No code or email sent' });
      return;
    }

    try {
      const hash = generateSecretHash(
        email,
        process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET!
      );

      const command = new ConfirmSignUpCommand({
        ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
        SecretHash: hash,
      });

      await cognito.send(command);

      // Update the user's verified status in the database
      try {
        await prisma.user.update({
          where: { email: email },
          data: { verified: true },
        });
      } catch (dbError) {
        console.error('Database update error:', dbError);
        // Don't fail the verification if database update fails
        // The user is still verified in Cognito
      }

      res.status(200).json({ message: 'Email verified successfully.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
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
    if (!email) {
      res.status(422).json({ message: 'No email given' });
      return;
    }

    try {
      const hash = generateSecretHash(
        email,
        process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET!
      );

      const command = new ResendConfirmationCodeCommand({
        ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
        Username: email,
        SecretHash: hash,
      });

      const response = await cognito.send(command);

      res.status(200).json({
        message: 'Verification email resent.',
        deliveryMedium: response.CodeDeliveryDetails?.DeliveryMedium,
        destination: response.CodeDeliveryDetails?.Destination,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
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
    try {
      // The user ID should be available from the auth middleware
      const userId = (req as any).user?.sub || (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Get user data from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          verified: true,
          instructorReviewStatus: true,
          profilePicture: true,
          bio: true,
          averageRating: true,
          subjects: true,
          education: true,
          experience: true,
          certificationUrls: true,
          grade: true,
          parentFirstName: true,
          parentLastName: true,
          parentEmail: true,
          parentPhone: true,
          interests: true,
          learningGoals: true,
          sessionRequests: true,
          verificationDocuments: {
            select: {
              id: true,
              fileName: true,
              contentType: true,
              sizeBytes: true,
              createdAt: true,
              s3Key: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const verificationDocuments = await Promise.all(
        user.verificationDocuments.map(async doc => ({
          id: doc.id,
          fileName: doc.fileName,
          contentType: doc.contentType,
          sizeBytes: doc.sizeBytes,
          createdAt: doc.createdAt,
          downloadUrl: await storageService.getSignedDownloadUrl(doc.s3Key),
        }))
      );

      res.json({
        ...user,
        verificationDocuments,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * @route POST /api/auth/logout
 * @desc Logout user from Cogntio
 * @access Private
 * @header Authorization: Bearer <token>
 */
export const logout = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authorization header missing or invalid' });

        return;
      }

      const accessToken = authHeader.split(' ')[1];

      const command = new GlobalSignOutCommand({
        AccessToken: accessToken,
      });

      await cognito.send(command);

      res.status(200).json({ message: 'Successfully logged out' });
    } catch (err: any) {
      if (err.name === 'NotAuthorizedException') {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }

      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh access token using a refresh token
 * @access Public
 * @body {
 *   refreshToken: string;
 * }
 */
export const refreshToken = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }
    try {
      const command = new InitiateAuthCommand({
        ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
        },
      });
      const response = await cognito.send(command);
      if (!response.AuthenticationResult) {
        res.status(401).json({ error: 'Invalid refresh token' });
        return;
      }
      res.json({
        accessToken: response.AuthenticationResult.AccessToken,
        idToken: response.AuthenticationResult.IdToken,
        expiresIn: response.AuthenticationResult.ExpiresIn,
        tokenType: response.AuthenticationResult.TokenType,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * @route POST /api/auth/forgot-password
 * @desc Initiate forgot password flow (send reset code to email)
 * @access Public
 * @body {
 *   email: string;
 * }
 */
export const forgotPassword = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    try {
      const hash = generateSecretHash(
        email,
        process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET!
      );
      const command = new ForgotPasswordCommand({
        ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        Username: email,
        SecretHash: hash,
      });
      await cognito.send(command);
      res.status(200).json({ message: 'Password reset code sent to email.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password using code sent to email
 * @access Public
 * @body {
 *   email: string;
 *   code: string; (or verificationCode)
 *   newPassword: string;
 * }
 */
export const resetPassword = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const raw = req.body || {};
    const bodyKeys = Object.keys(raw);
    console.log('[reset-password] Received body keys:', bodyKeys.join(', ') || '(none)');

    const email = typeof raw.email === 'string' ? raw.email.trim() : '';
    const code = typeof raw.code === 'string'
      ? raw.code.trim()
      : (typeof raw.verificationCode === 'string' ? raw.verificationCode.trim() : '');
    const newPassword = typeof raw.newPassword === 'string' ? raw.newPassword : '';

    if (!email || !code || !newPassword) {
      console.log('[reset-password] Validation failed: hasEmail=', !!email, 'codeLen=', code.length, 'hasNewPassword=', !!newPassword);
      res.status(400).json({ error: 'Email, code, and new password are required' });
      return;
    }
    try {
      const hash = generateSecretHash(
        email,
        process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET!
      );
      const command = new ConfirmForgotPasswordCommand({
        ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword,
        SecretHash: hash,
      });
      await cognito.send(command);
      console.log('[reset-password] Success for email:', email);
      res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (err: any) {
      const name = err?.name || '';
      const cognitoMsg = err?.message || '';
      console.error('[reset-password] Cognito error:', name, cognitoMsg);
      let message = cognitoMsg || 'Failed to reset password.';
      if (name === 'CodeMismatchException') {
        message = 'Invalid verification code. Please check the code and try again, or request a new code.';
      } else if (name === 'ExpiredCodeException') {
        message = 'Verification code has expired. Please request a new code from the previous step.';
      } else if (name === 'InvalidPasswordException') {
        message = 'Password does not meet requirements. Use at least 8 characters with uppercase, lowercase, numbers, and symbols.';
      } else if (name === 'UserNotFoundException') {
        message = 'No account found with this email.';
      }
      res.status(400).json({ error: message });
    }
  }
);
