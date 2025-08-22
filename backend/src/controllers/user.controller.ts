import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { TroopService } from '../services/troop.service';
import { successResponse, errorResponse } from '../utils/response';

export class UserController {
  // Get all users (admin only)
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      // Note: In a real application, you'd want to add pagination and filtering
      const { page = 1, limit = 10, troopId } = req.query;
      
      let users;
      
      if (troopId) {
        // Get users by troop
        users = await UserService.getUsersByTroopId(troopId as string);
      } else {
        // For now, we'll implement a basic query since UserService doesn't have a getAll method
        // You might want to add this method to UserService
        successResponse(res, 'Feature not implemented yet - use troop-specific user queries', []);
        return;
      }

      successResponse(res, 'Users retrieved successfully', users);
    } catch (error: any) {
      console.error('Get all users error:', error);
      errorResponse(res, 'Failed to get users: ' + error.message, 500);
    }
  }

  // Get user by ID
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await UserService.findUserById(id);
      if (!user) {
        errorResponse(res, 'User not found', 404);
        return;
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      successResponse(res, 'User retrieved successfully', userWithoutPassword);
    } catch (error: any) {
      console.error('Get user by ID error:', error);
      errorResponse(res, 'Failed to get user: ' + error.message, 500);
    }
  }

  // Get user with their scouts
  static async getUserWithScouts(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const userWithScouts = await UserService.getUserWithScouts(id);
      if (!userWithScouts) {
        errorResponse(res, 'User not found', 404);
        return;
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = userWithScouts;

      successResponse(res, 'User with scouts retrieved successfully', userWithoutPassword);
    } catch (error: any) {
      console.error('Get user with scouts error:', error);
      errorResponse(res, 'Failed to get user with scouts: ' + error.message, 500);
    }
  }

  // Get user's troops
  static async getUserTroops(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const troops = await TroopService.getTroopsForUser(id);

      successResponse(res, 'User troops retrieved successfully', troops);
    } catch (error: any) {
      console.error('Get user troops error:', error);
      errorResponse(res, 'Failed to get user troops: ' + error.message, 500);
    }
  }

  // Update user (admin only)
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated through this endpoint
      const { password, provider, provider_id, ...safeUpdateData } = updateData;

      const updatedUser = await UserService.updateUser(id, safeUpdateData);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;

      successResponse(res, 'User updated successfully', userWithoutPassword);
    } catch (error: any) {
      console.error('Update user error:', error);
      errorResponse(res, 'Failed to update user: ' + error.message, 500);
    }
  }

  // Delete user (admin only)
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if user exists
      const user = await UserService.findUserById(id);
      if (!user) {
        errorResponse(res, 'User not found', 404);
        return;
      }

      await UserService.deleteUser(id);

      successResponse(res, 'User deleted successfully');
    } catch (error: any) {
      console.error('Delete user error:', error);
      errorResponse(res, 'Failed to delete user: ' + error.message, 500);
    }
  }

  // Add user to troop
  static async addUserToTroop(req: Request, res: Response): Promise<void> {
    try {
      const { userId, troopId, role } = req.body;

      // Validate that user and troop exist
      const user = await UserService.findUserById(userId);
      if (!user) {
        errorResponse(res, 'User not found', 404);
        return;
      }

      const troop = await TroopService.findTroopById(troopId);
      if (!troop) {
        errorResponse(res, 'Troop not found', 404);
        return;
      }

      await TroopService.addUserToTroop(userId, troopId, role);

      successResponse(res, 'User added to troop successfully');
    } catch (error: any) {
      console.error('Add user to troop error:', error);
      errorResponse(res, 'Failed to add user to troop: ' + error.message, 500);
    }
  }

  // Remove user from troop
  static async removeUserFromTroop(req: Request, res: Response): Promise<void> {
    try {
      const { userId, troopId } = req.params;
      const { role } = req.query;

      await TroopService.removeUserFromTroop(userId, troopId, role as string);

      successResponse(res, 'User removed from troop successfully');
    } catch (error: any) {
      console.error('Remove user from troop error:', error);
      errorResponse(res, 'Failed to remove user from troop: ' + error.message, 500);
    }
  }

  // Update user background check status
  static async updateBackgroundCheckStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, date } = req.body;

      const updatedUser = await UserService.updateUser(id, {
        background_check_status: status,
        background_check_date: date ? new Date(date).toISOString() : null
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;

      successResponse(res, 'Background check status updated successfully', userWithoutPassword);
    } catch (error: any) {
      console.error('Update background check status error:', error);
      errorResponse(res, 'Failed to update background check status: ' + error.message, 500);
    }
  }

  // Update youth protection training status
  static async updateYouthProtectionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { date } = req.body;

      const updatedUser = await UserService.updateUser(id, {
        youth_protection_date: date ? new Date(date).toISOString() : null
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;

      successResponse(res, 'Youth protection status updated successfully', userWithoutPassword);
    } catch (error: any) {
      console.error('Update youth protection status error:', error);
      errorResponse(res, 'Failed to update youth protection status: ' + error.message, 500);
    }
  }

  // Get current user's dashboard data
  static async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        errorResponse(res, 'User not authenticated', 401);
        return;
      }

      // Get user with scouts
      const userWithScouts = await UserService.getUserWithScouts(userId);
      if (!userWithScouts) {
        errorResponse(res, 'User not found', 404);
        return;
      }

      // Get user's troops
      const troops = await TroopService.getTroopsForUser(userId);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = userWithScouts;

      const dashboardData = {
        user: userWithoutPassword,
        troops: troops,
        summary: {
          totalScouts: userWithScouts.scouts?.length || 0,
          totalTroops: troops.length
        }
      };

      successResponse(res, 'Dashboard data retrieved successfully', dashboardData);
    } catch (error: any) {
      console.error('Get dashboard error:', error);
      errorResponse(res, 'Failed to get dashboard data: ' + error.message, 500);
    }
  }
}