import { Request, Response, NextFunction } from 'express';
import { Auth } from '../core/auth';
import { UserPayload } from '../core/types';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

/**
 * Express middleware for JWT authentication
 * @param {Auth} auth - Instance of the Auth class
 * @returns {Function} - Express middleware function
 */
export const authMiddleware = (auth: Auth) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = auth.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid or expired token.'
      });
    }

    req.user = decoded;
    next();
  };
};