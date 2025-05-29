import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

/**
 * Middleware to authenticate JWT tokens
 * Attaches user to request object if token is valid
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
        error: 'Authorization header missing or invalid format',
      });
      return;
    }

    // Verify token
    const decoded = authService.verifyToken(token);

    // Get user from database
    const user = await authService.getUserById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: 'User not found',
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error: any) {
    console.error('Authentication middleware error:', error.message);

    if (error.message === 'Token expired') {
      res.status(401).json({
        success: false,
        message: 'Token expired',
        error: 'Please login again',
      });
      return;
    }

    if (error.message === 'Invalid token') {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: 'Authentication failed',
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: 'Token verification failed',
    });
  }
};
