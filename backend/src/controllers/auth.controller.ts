import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserService } from '../services/user.service';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { successResponse, errorResponse } from '../utils/response';
import { env } from '../config/env';

export class AuthController {
  // Register a new user
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, firstName, lastName, password, phone, address } = req.body;

      // Check if user already exists
      const existingUser = await UserService.findUserByEmail(email);
      if (existingUser) {
        errorResponse(res, 'User already exists with this email', 409);
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

      // Create user
      const user = await UserService.createUser({
        email,
        first_name: firstName,
        last_name: lastName,
        password: hashedPassword,
        phone,
        address,
        email_verified: false
      });

      // Generate tokens
      const accessToken = generateAccessToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      successResponse(res, 'User registered successfully', {
        user: userWithoutPassword,
        tokens: {
          accessToken,
          refreshToken
        }
      }, 201);
    } catch (error: any) {
      console.error('Register error:', error);
      errorResponse(res, 'Failed to register user: ' + error.message, 500);
    }
  }

  // Login user
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await UserService.findUserByEmail(email);
      if (!user) {
        errorResponse(res, 'Invalid credentials', 401);
        return;
      }

      // Check password
      if (!user.password) {
        errorResponse(res, 'Please use social login for this account', 400);
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        errorResponse(res, 'Invalid credentials', 401);
        return;
      }

      // Generate tokens
      const accessToken = generateAccessToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      successResponse(res, 'Login successful', {
        user: userWithoutPassword,
        tokens: {
          accessToken,
          refreshToken
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      errorResponse(res, 'Failed to login: ' + error.message, 500);
    }
  }

  // Refresh access token
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        errorResponse(res, 'Refresh token is required', 400);
        return;
      }

      // Verify refresh token
      const decoded = verifyToken(refreshToken, env.JWT_REFRESH_SECRET) as any;
      if (!decoded) {
        errorResponse(res, 'Invalid refresh token', 401);
        return;
      }

      // Find user
      const user = await UserService.findUserById(decoded.userId);
      if (!user) {
        errorResponse(res, 'User not found', 404);
        return;
      }

      // Generate new access token
      const newAccessToken = generateAccessToken({ userId: user.id, email: user.email });

      successResponse(res, 'Token refreshed successfully', {
        accessToken: newAccessToken
      });
    } catch (error: any) {
      console.error('Refresh token error:', error);
      errorResponse(res, 'Failed to refresh token: ' + error.message, 500);
    }
  }

  // Get current user profile
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        errorResponse(res, 'User not authenticated', 401);
        return;
      }

      const user = await UserService.findUserById(userId);
      if (!user) {
        errorResponse(res, 'User not found', 404);
        return;
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      successResponse(res, 'Profile retrieved successfully', userWithoutPassword);
    } catch (error: any) {
      console.error('Get profile error:', error);
      errorResponse(res, 'Failed to get profile: ' + error.message, 500);
    }
  }

  // Update user profile
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { firstName, lastName, phone, address } = req.body;

      if (!userId) {
        errorResponse(res, 'User not authenticated', 401);
        return;
      }

      const updatedUser = await UserService.updateUser(userId, {
        first_name: firstName,
        last_name: lastName,
        phone,
        address
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;

      successResponse(res, 'Profile updated successfully', userWithoutPassword);
    } catch (error: any) {
      console.error('Update profile error:', error);
      errorResponse(res, 'Failed to update profile: ' + error.message, 500);
    }
  }

  // Change password
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        errorResponse(res, 'User not authenticated', 401);
        return;
      }

      const user = await UserService.findUserById(userId);
      if (!user || !user.password) {
        errorResponse(res, 'User not found or password not set', 404);
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        errorResponse(res, 'Current password is incorrect', 400);
        return;
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);

      // Update password
      await UserService.updateUser(userId, {
        password: hashedNewPassword
      });

      successResponse(res, 'Password changed successfully');
    } catch (error: any) {
      console.error('Change password error:', error);
      errorResponse(res, 'Failed to change password: ' + error.message, 500);
    }
  }

  // OAuth login (Google, Facebook, etc.)
  static async oauthLogin(req: Request, res: Response): Promise<void> {
    try {
      const { provider, providerId, email, firstName, lastName } = req.body;

      // Check if user exists with OAuth provider
      let user = await UserService.findUserByProvider(provider, providerId);

      if (!user) {
        // Check if user exists with email
        user = await UserService.findUserByEmail(email);
        
        if (user) {
          // Link OAuth provider to existing user
          await UserService.updateUser(user.id, {
            provider,
            provider_id: providerId
          });
        } else {
          // Create new user with OAuth
          user = await UserService.createUser({
            email,
            first_name: firstName,
            last_name: lastName,
            provider,
            provider_id: providerId,
            email_verified: true // OAuth emails are typically verified
          });
        }
      }

      // Generate tokens
      const accessToken = generateAccessToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      successResponse(res, 'OAuth login successful', {
        user: userWithoutPassword,
        tokens: {
          accessToken,
          refreshToken
        }
      });
    } catch (error: any) {
      console.error('OAuth login error:', error);
      errorResponse(res, 'Failed to process OAuth login: ' + error.message, 500);
    }
  }
}