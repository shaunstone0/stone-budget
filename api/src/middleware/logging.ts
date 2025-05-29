import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  ip: string;
  userAgent: string;
  userId?: string;
  statusCode?: number;
  responseTime?: number;
}

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Create log entry
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
  };

  // Add user ID if available (authenticated requests)
  const authReq = req as AuthenticatedRequest;
  if (authReq.user) {
    logEntry.userId = authReq.user._id.toString();
  }

  // Log request
  if (process.env.NODE_ENV === 'development') {
    console.log(`[REQUEST] ${logEntry.method} ${logEntry.url} - ${logEntry.ip}`);
  }

  // Capture response
  const originalSend = res.send;
  res.send = function (body) {
    logEntry.statusCode = res.statusCode;
    logEntry.responseTime = Date.now() - startTime;

    // Log response
    if (process.env.NODE_ENV === 'development') {
      const statusText = logEntry.statusCode < 400 ? 'SUCCESS' : 'ERROR';
      console.log(
        `[RESPONSE] ${statusText} ${logEntry.method} ${logEntry.url} - ${logEntry.statusCode} - ${logEntry.responseTime}ms`
      );
    }

    // Log errors in production
    if (process.env.NODE_ENV === 'production' && logEntry.statusCode >= 400) {
      console.error('API Error:', {
        ...logEntry,
        body: logEntry.statusCode >= 500 ? undefined : body, // Don't log response body for 5xx errors
      });
    }

    return originalSend.call(this, body);
  };

  next();
};

/**
 * Error logging middleware
 */
export const errorLogger = (error: any, req: Request, res: Response, next: NextFunction): void => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    body: req.body,
    params: req.params,
    query: req.query,
  };

  // Add user ID if available
  const authReq = req as AuthenticatedRequest;
  if (authReq.user) {
    (errorLog as any).userId = authReq.user._id.toString();
  }

  console.error('API Error:', errorLog);

  next(error);
};
