import expressAsyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import { cognito } from "../lib/cognitoSDK";
import {
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { prisma } from "../config/prisma";
import crypto from "crypto";
// Request body interfaces
interface SignupBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "student" | "instructor";
  street: string
  apartment: string
  city: string
  state: string
  zip: string
  country: string
  schoolName: string
  birthdate: Date
  grade?: string; // Optional for students
  subjects?: string[]; // Optional for instructors
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
    .createHmac("sha256", clientSecret)
    .update(username + clientId)
    .digest("base64");
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
 *   role: "student" | "instructor";
 *   grade?: string; // Optional for students
 *   subjects?: string[]; // Optional for instructors
 * }
 */
export const signup = expressAsyncHandler(
  async (req: Request<{}, {}, SignupBody>, res: Response, next: NextFunction) => {

    const { firstName, lastName, role, grade, subjects, password, email, parentEmail, birthdate, street, apartment, city, state, zip, country, schoolName } = req.body;
    if (!firstName || !lastName || !email || !password || !birthdate || !schoolName) {
      res.status(400).json({ error: "Email, name, password, birthdate, and schoolName are required." });
      return;
    }
    try {
      const hash = generateSecretHash(
        email,
        process.env.COGNITO_CLIENT_ID!,
        process.env.COGNITO_CLIENT_SECRET!
      );
      const command = new SignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID!,
        SecretHash: hash,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: 'email', Value: email },
        ],
      });

      const response = await cognito.send(command);

      if(!response.UserSub)
      {
        res.status(401).json("No user sub");
        return;
      }

      //call the database
      try {
        if (role === "student") {

          await prisma.user.create({
            data: {
              id: response.UserSub,
              firstName: firstName,
              lastName: lastName,
              grade: grade,
              email: email,
              birthdate: new Date(birthdate).toISOString(),
              parentEmail: parentEmail,
              street: street,
              apartment: apartment,
              city : city,
              state: state,
              zip: zip,
              country: country,
              schoolName: schoolName,
              role: "STUDENT"
            }
          });

          res.status(201).json({ message: "Signup successful", userSub: response.UserSub });
          return;
        } else {
          const subjects_to_add = await prisma.subject.findMany({
            where: {
              name: { in: subjects }
            },
            select: { id: true }
          });

          if (subjects_to_add.length !== (subjects?.length ?? 0)) {
            res.status(400).json({ error: "One or more subjects not found" });
            return;
          }

          await prisma.user.create({
            data: {
              id: response.UserSub,
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
              subjects: {
                connect: subjects_to_add.map((s) => ({ id: s.id }))
              },
              role: "INSTRUCTOR",
            }
          });

          res.status(201).json({ message: "Signup successful", userSub: response.UserSub });
          return;
        }
      } catch (dbError) {
        console.error(dbError);
        res.status(500).json({ error: "Internal DB error" });
        return;

      }

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
      return;
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
      res.status(400).json("Email and password is required");
      return;
    }
    try {
      const hash = generateSecretHash(
        email,
        process.env.COGNITO_CLIENT_ID!,
        process.env.COGNITO_CLIENT_SECRET!
      );

      const command = new InitiateAuthCommand({
        ClientId: process.env.COGNITO_CLIENT_ID!,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
          SECRET_HASH: hash,
        },
      });

      const response = await cognito.send(command);

      if (!response.AuthenticationResult) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      res.json({
        email: email,
        idToken: response.AuthenticationResult.IdToken,
        accessToken: response.AuthenticationResult.AccessToken,
        refreshToken: response.AuthenticationResult.RefreshToken,
      });
    } catch (err: any) {
      if (err.name === "UserNotConfirmedException") {
        res
          .status(403)
          .json({ message: "User is not confirmed", needsConfirmation: true });
        return;
      }
      console.error("Error logging in:", err);
      res.status(500).json({ error: err.message });
    }
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