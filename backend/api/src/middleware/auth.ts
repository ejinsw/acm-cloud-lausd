import { Request, Response, NextFunction } from "express";
import { cognito } from "../lib/cognitoSDK";
import { GetUserCommand } from "@aws-sdk/client-cognito-identity-provider";

interface CognitoUser {
  sub: string;
  email: string;
  role?: string;
  // Add other Cognito attributes as needed
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization header missing or invalid" });
    }

    const accessToken = authHeader.split(" ")[1];

    // Verify the token with Cognito
    const command = new GetUserCommand({
      AccessToken: accessToken
    });

    const response = await cognito.send(command);
    
    // Extract user information from Cognito response
    const user: CognitoUser = {
      sub: response.UserAttributes?.find(attr => attr.Name === 'sub')?.Value || '',
      email: response.UserAttributes?.find(attr => attr.Name === 'email')?.Value || '',
      role: response.UserAttributes?.find(attr => attr.Name === 'custom:role')?.Value || 'student',
    };

    // Attach user to request object
    (req as any).user = user;
    next();
  } catch (error: any) {
    if (error.name === "NotAuthorizedException" || error.name === "InvalidParameterException") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    console.error("Auth middleware error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as CognitoUser;
    const userRole = user?.role;
    
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        message: 'You do not have permission to access this resource',
      });
    }

    next();
  };
};
