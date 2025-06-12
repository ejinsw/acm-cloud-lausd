import { Request, Response, NextFunction } from "express";
import { expressjwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
import { User } from "../types";

//this needs to change to cognito
export const authenticateToken = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
});

export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req.user as User)?.user_metadata?.role;
    
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource",
      });
    }
    
    next();
  };
}; 