import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/jwt';
import { errorResponse } from '@/utils/response';
import logger from '@/config/logger';

export const authenticate = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access token required', 401);
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    
    req.user = payload;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

// Simplified for now - can be enhanced later with role-based access
export const authorize = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }
    // For now, just pass through - implement role checking later
    next();
  };
};