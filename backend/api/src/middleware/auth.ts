import { Request, Response, NextFunction } from 'express';
import { cognito } from '../lib/cognitoSDK';
import { GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { prisma } from '../config/prisma';
import { UserRole } from '@prisma/client';

interface CognitoUser {
  sub: string;
  email: string;
  role?: string;
  // Add other Cognito attributes as needed
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }

    const accessToken = authHeader.split(' ')[1];

    // Try to decode as JWT first (for frontend tokens)
    try {
      const tokenParts = accessToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        const userId = payload.sub || payload.id;

        if (userId) {
          // Get user from database
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, role: true }
          });

          if (dbUser) {
            const user: CognitoUser = {
              sub: dbUser.id,
              email: dbUser.email,
              role: dbUser.role,
            };
            (req as any).user = user;
            next();
            return;
          }
        }
      }
    } catch (jwtError) {
      // JWT decode failed, trying Cognito
    }

    // If JWT decode fails, try Cognito as fallback
    try {
      const command = new GetUserCommand({
        AccessToken: accessToken,
      });

      let response = await cognito.send(command);

      // Extract user information from Cognito response
      const user: CognitoUser = {
        sub: response.UserAttributes?.find(attr => attr.Name === 'sub')?.Value || '',
        email: response.UserAttributes?.find(attr => attr.Name === 'email')?.Value || '',
        role: response.UserAttributes?.find(attr => attr.Name === 'custom:role')?.Value || 'STUDENT',
      };

      try {
        await prisma.user.upsert({
          where: {
            email: user.email
          },
          create: {
            id: user.sub,
            email: user.email,
            role: (user.role?.toUpperCase() as UserRole) || 'STUDENT',
            firstName: '',
            lastName: '',
          },
          update: {
            id: user.sub,
          },
        });
      } catch (error) {
        // User already exists
      }

      // Attach user to request object
      (req as any).user = user;
      next();
    } catch (cognitoError: any) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as CognitoUser;
    const userRole = user?.role?.toUpperCase();

    if (!userRole) {
      return res.status(403).json({
        message: 'User role not found',
      });
    }

    if (userRole === "ADMIN") {
      next();
      return;
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        message: `You do not have permission to access this resource. Required role: ${roles.join(' or ')}, Your role: ${userRole}`,
      });
    }

    next();
  };
};
