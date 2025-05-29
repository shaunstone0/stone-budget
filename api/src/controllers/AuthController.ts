import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { AuthService } from '../services/AuthService';
import { CreateUserDTO, LoginDTO, AuthenticatedRequest } from '../types';

export class AuthController extends BaseController {
  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   * POST /api/auth/register
   */
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password }: CreateUserDTO = req.body;

      // Validate required fields
      const validation = this.validateRequiredFields(req.body, ['name', 'email', 'password']);
      if (!validation.isValid) {
        this.sendBadRequest(res, 'Missing required fields', validation.missingFields.join(', '));
        return;
      }

      // Validate email format
      if (!this.authService.isValidEmail(email)) {
        this.sendBadRequest(res, 'Invalid email format');
        return;
      }

      // Validate password strength
      const passwordValidation = this.authService.validatePassword(password);
      if (!passwordValidation.isValid) {
        this.sendBadRequest(
          res,
          'Password validation failed',
          passwordValidation.errors.join(', ')
        );
        return;
      }

      // Register user
      const result = await this.authService.register({ name, email, password });

      this.sendCreated(res, 'User registered successfully', result);
    } catch (error: any) {
      console.error('Registration error:', error.message);

      if (error.message === 'User with this email already exists') {
        this.sendConflict(res, 'Registration failed', error.message);
        return;
      }

      this.sendError(res, 'Registration failed', 500, error.message);
    }
  };

  /**
   * Login user
   * POST /api/auth/login
   */
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password }: LoginDTO = req.body;

      // Validate required fields
      const validation = this.validateRequiredFields(req.body, ['email', 'password']);
      if (!validation.isValid) {
        this.sendBadRequest(res, 'Missing required fields', validation.missingFields.join(', '));
        return;
      }

      // Validate email format
      if (!this.authService.isValidEmail(email)) {
        this.sendBadRequest(res, 'Invalid email format');
        return;
      }

      // Login user
      const result = await this.authService.login({ email, password });

      this.sendSuccess(res, 'Login successful', result);
    } catch (error: any) {
      console.error('Login error:', error.message);

      if (error.message === 'Invalid credentials') {
        this.sendUnauthorized(res, 'Invalid email or password');
        return;
      }

      this.sendError(res, 'Login failed', 500, error.message);
    }
  };

  /**
   * Get current user profile
   * GET /api/auth/profile
   */
  public getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        this.sendUnauthorized(res, 'User not authenticated');
        return;
      }

      const safeUser = await this.authService.getSafeUserById(req.user._id.toString());
      if (!safeUser) {
        this.sendNotFound(res, 'User not found');
        return;
      }

      this.sendSuccess(res, 'Profile retrieved successfully', {
        user: {
          id: safeUser._id.toString(),
          name: safeUser.name,
          email: safeUser.email,
          createdAt: safeUser.createdAt,
        },
      });
    } catch (error: any) {
      console.error('Get profile error:', error.message);
      this.sendError(res, 'Failed to retrieve profile', 500, error.message);
    }
  };

  /**
   * Verify token (health check for authentication)
   * GET /api/auth/verify
   */
  public verifyToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        this.sendUnauthorized(res, 'Token verification failed');
        return;
      }

      this.sendSuccess(res, 'Token is valid', {
        user: {
          id: req.user._id.toString(),
          name: req.user.name,
          email: req.user.email,
        },
        tokenValid: true,
      });
    } catch (error: any) {
      console.error('Token verification error:', error.message);
      this.sendError(res, 'Token verification failed', 500, error.message);
    }
  };

  /**
   * Logout user (client-side token removal)
   * POST /api/auth/logout
   */
  public logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Since we're using JWT, logout is handled client-side by removing the token
      // This endpoint is mainly for logging purposes and consistency

      const userId = req.user?._id.toString() || 'unknown';
      console.log(`User logged out: ${userId}`);

      this.sendSuccess(res, 'Logout successful', {
        message: 'Please remove the token from client storage',
      });
    } catch (error: any) {
      console.error('Logout error:', error.message);
      this.sendError(res, 'Logout failed', 500, error.message);
    }
  };
}
