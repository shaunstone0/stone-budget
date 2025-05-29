import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { CreateUserDTO, LoginDTO, AuthResponse, IUser, SafeUser } from '../types';

export class AuthService {
  private readonly saltRounds: number = 12;
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

    if (!process.env.JWT_SECRET) {
      console.warn('JWT_SECRET not found in environment variables. Using fallback.');
    }
  }

  /**
   * Register a new user
   */
  public async register(userData: CreateUserDTO): Promise<AuthResponse> {
    const { name, email, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const password_hash = await this.hashPassword(password);

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
    });

    await user.save();

    // Generate token
    const token = this.generateToken(user._id.toString());

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    };
  }

  /**
   * Login user
   */
  public async login(credentials: LoginDTO): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user._id.toString());

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    };
  }

  /**
   * Get user by ID (for token verification)
   */
  public async getUserById(userId: string): Promise<IUser | null> {
    try {
      const user = await User.findById(userId);
      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get safe user data (without password hash)
   */
  public async getSafeUserById(userId: string): Promise<SafeUser | null> {
    try {
      const user = await User.findById(userId).select('-password_hash');
      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify JWT token and return user ID
   */
  public verifyToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, this.jwtSecret) as { userId: string };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string): string {
    return jwt.sign({ userId } as object, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      algorithm: 'HS256',
    } as jwt.SignOptions);
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Verify password against hash
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Validate email format
   */
  public isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength (basic requirements)
   */
  public validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (password.length > 100) {
      errors.push('Password must be less than 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
