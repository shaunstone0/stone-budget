import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import { ApiResponse } from './types';

interface AppConfig {
  port: number;
  frontendUrl: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
}

export class App {
  public app: Application;
  private readonly config: AppConfig;

  constructor() {
    this.app = express();
    this.config = {
      port: parseInt(process.env.PORT || '3000', 10),
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
      rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
      rateLimitMax: 100, // requests per window
    };

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(
      helmet({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
          },
        },
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: this.config.rateLimitWindowMs,
      max: this.config.rateLimitMax,
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        error: 'Rate limit exceeded',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // CORS configuration
    this.app.use(
      cors({
        origin: (origin, callback) => {
          // Allow requests with no origin (mobile apps, etc.)
          if (!origin) return callback(null, true);

          const allowedOrigins = [
            this.config.frontendUrl,
            'http://localhost:4200',
            'http://localhost:3000',
          ];

          if (allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      })
    );

    // Body parsing middleware
    this.app.use(
      express.json({
        limit: '10mb',
        type: 'application/json',
      })
    );

    this.app.use(
      express.urlencoded({
        extended: true,
        limit: '10mb',
      })
    );

    // Request logging middleware (development only)
    if (process.env.NODE_ENV === 'development') {
      this.app.use((req: Request, _res: Response, next: NextFunction) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
      });
    }
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req: Request, res: Response) => {
      const healthCheck: ApiResponse = {
        success: true,
        message: 'Server is running',
        data: {
          timestamp: new Date().toISOString(),
          service: 'Family Expense Tracker API',
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
        },
      };
      res.status(200).json(healthCheck);
    });

    // API base route
    this.app.get('/api', (_req: Request, res: Response) => {
      const apiInfo: ApiResponse = {
        success: true,
        message: 'Family Expense Tracker API',
        data: {
          version: '1.0.0',
          endpoints: ['/api/auth', '/api/bills', '/api/categories', '/api/banks', '/api/balances'],
        },
      };
      res.status(200).json(apiInfo);
    });

    // TODO: Add route handlers here
    // this.app.use('/api/auth', authRoutes);
    // this.app.use('/api/bills', billRoutes);
    // this.app.use('/api/categories', categoryRoutes);
    // this.app.use('/api/banks', bankRoutes);
    // this.app.use('/api/balances', balanceRoutes);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      const notFoundResponse: ApiResponse = {
        success: false,
        message: 'Route not found',
        error: `Cannot ${req.method} ${req.originalUrl}`,
      };
      res.status(404).json(notFoundResponse);
    });

    // Global error handler
    this.app.use((error: any, req: Request, res: Response, _next: NextFunction): void => {
      console.error('Global error handler:', {
        error: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });

      // Mongoose validation error
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map((err: any) => err.message);
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: validationErrors.join(', '),
        });
        return;
      }

      // MongoDB duplicate key error
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        res.status(409).json({
          success: false,
          message: 'Duplicate entry',
          error: `${field} already exists`,
        });
        return;
      }

      // JWT errors
      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
          success: false,
          message: 'Invalid token',
          error: 'Authentication failed',
        });
        return;
      }

      if (error.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          message: 'Token expired',
          error: 'Please login again',
        });
        return;
      }

      // CORS error
      if (error.message === 'Not allowed by CORS') {
        res.status(403).json({
          success: false,
          message: 'CORS error',
          error: 'Origin not allowed',
        });
        return;
      }

      // Default error response
      const errorResponse: ApiResponse = {
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
        error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.stack,
      };

      res.status(error.status || 500).json(errorResponse);
    });
  }

  public getApp(): Application {
    return this.app;
  }

  public getPort(): number {
    return this.config.port;
  }
}
