import { Request, Response } from 'express';
import { TroopService } from '../services/troop.service';
import { successResponse, errorResponse } from '../utils/response';

export class TroopController {
  // Get all active troops
  static async getAllTroops(req: Request, res: Response): Promise<void> {
    try {
      const troops = await TroopService.getActiveTroops();
      successResponse(res, 'Troops retrieved successfully', troops);
    } catch (error: any) {
      console.error('Get all troops error:', error);
      errorResponse(res, 'Failed to get troops: ' + error.message, 500);
    }
  }

  // Get troop by ID
  static async getTroopById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const troop = await TroopService.findTroopById(id);
      if (!troop) {
        errorResponse(res, 'Troop not found', 404);
        return;
      }

      successResponse(res, 'Troop retrieved successfully', troop);
    } catch (error: any) {
      console.error('Get troop by ID error:', error);
      errorResponse(res, 'Failed to get troop: ' + error.message, 500);
    }
  }

  // Get troop with members
  static async getTroopWithMembers(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const troopWithMembers = await TroopService.getTroopWithMembers(id);
      if (!troopWithMembers) {
        errorResponse(res, 'Troop not found', 404);
        return;
      }

      successResponse(res, 'Troop with members retrieved successfully', troopWithMembers);
    } catch (error: any) {
      console.error('Get troop with members error:', error);
      errorResponse(res, 'Failed to get troop with members: ' + error.message, 500);
    }
  }

  // Get troop statistics
  static async getTroopStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if troop exists
      const troop = await TroopService.findTroopById(id);
      if (!troop) {
        errorResponse(res, 'Troop not found', 404);
        return;
      }

      const stats = await TroopService.getTroopStats(id);

      successResponse(res, 'Troop statistics retrieved successfully', stats);
    } catch (error: any) {
      console.error('Get troop stats error:', error);
      errorResponse(res, 'Failed to get troop statistics: ' + error.message, 500);
    }
  }

  // Create new troop
  static async createTroop(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        errorResponse(res, 'User not authenticated', 401);
        return;
      }

      const troopData = {
        ...req.body,
        created_by_id: userId,
        founded_date: req.body.foundedDate ? new Date(req.body.foundedDate).toISOString() : new Date().toISOString()
      };

      // Remove client-side field names that don't match database schema
      const {
        foundedDate,
        charterOrganization,
        meetingSchedule,
        meetingLocation,
        contactEmail,
        contactPhone,
        troopSizeLimit,
        ...baseData
      } = troopData;

      const formattedTroopData = {
        ...baseData,
        charter_organization: charterOrganization,
        meeting_schedule: meetingSchedule,
        meeting_location: meetingLocation,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        troop_size_limit: troopSizeLimit || 100
      };

      const newTroop = await TroopService.createTroop(formattedTroopData);

      // Add the creator as Scoutmaster by default
      await TroopService.addUserToTroop(userId, newTroop.id, 'SCOUTMASTER');

      successResponse(res, 'Troop created successfully', newTroop, 201);
    } catch (error: any) {
      console.error('Create troop error:', error);
      errorResponse(res, 'Failed to create troop: ' + error.message, 500);
    }
  }

  // Update troop
  static async updateTroop(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if troop exists
      const existingTroop = await TroopService.findTroopById(id);
      if (!existingTroop) {
        errorResponse(res, 'Troop not found', 404);
        return;
      }

      // Format field names to match database schema
      const {
        foundedDate,
        charterOrganization,
        meetingSchedule,
        meetingLocation,
        contactEmail,
        contactPhone,
        troopSizeLimit,
        ...baseData
      } = updateData;

      const formattedUpdateData = {
        ...baseData,
        ...(foundedDate && { founded_date: new Date(foundedDate).toISOString() }),
        ...(charterOrganization && { charter_organization: charterOrganization }),
        ...(meetingSchedule && { meeting_schedule: meetingSchedule }),
        ...(meetingLocation && { meeting_location: meetingLocation }),
        ...(contactEmail && { contact_email: contactEmail }),
        ...(contactPhone && { contact_phone: contactPhone }),
        ...(troopSizeLimit && { troop_size_limit: troopSizeLimit })
      };

      const updatedTroop = await TroopService.updateTroop(id, formattedUpdateData);

      successResponse(res, 'Troop updated successfully', updatedTroop);
    } catch (error: any) {
      console.error('Update troop error:', error);
      errorResponse(res, 'Failed to update troop: ' + error.message, 500);
    }
  }

  // Add member to troop
  static async addMemberToTroop(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId, role } = req.body;

      // Check if troop exists
      const troop = await TroopService.findTroopById(id);
      if (!troop) {
        errorResponse(res, 'Troop not found', 404);
        return;
      }

      await TroopService.addUserToTroop(userId, id, role);

      successResponse(res, 'Member added to troop successfully');
    } catch (error: any) {
      console.error('Add member to troop error:', error);
      errorResponse(res, 'Failed to add member to troop: ' + error.message, 500);
    }
  }

  // Remove member from troop
  static async removeMemberFromTroop(req: Request, res: Response): Promise<void> {
    try {
      const { id, userId } = req.params;
      const { role } = req.query;

      // Check if troop exists
      const troop = await TroopService.findTroopById(id);
      if (!troop) {
        errorResponse(res, 'Troop not found', 404);
        return;
      }

      await TroopService.removeUserFromTroop(userId, id, role as string);

      successResponse(res, 'Member removed from troop successfully');
    } catch (error: any) {
      console.error('Remove member from troop error:', error);
      errorResponse(res, 'Failed to remove member from troop: ' + error.message, 500);
    }
  }

  // Get troops for current user
  static async getMyTroops(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        errorResponse(res, 'User not authenticated', 401);
        return;
      }

      const troops = await TroopService.getTroopsForUser(userId);

      successResponse(res, 'User troops retrieved successfully', troops);
    } catch (error: any) {
      console.error('Get my troops error:', error);
      errorResponse(res, 'Failed to get user troops: ' + error.message, 500);
    }
  }

  // Archive troop (soft delete)
  static async archiveTroop(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if troop exists
      const troop = await TroopService.findTroopById(id);
      if (!troop) {
        errorResponse(res, 'Troop not found', 404);
        return;
      }

      const archivedTroop = await TroopService.updateTroop(id, { status: 'ARCHIVED' });

      successResponse(res, 'Troop archived successfully', archivedTroop);
    } catch (error: any) {
      console.error('Archive troop error:', error);
      errorResponse(res, 'Failed to archive troop: ' + error.message, 500);
    }
  }

  // Reactivate troop
  static async reactivateTroop(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if troop exists
      const troop = await TroopService.findTroopById(id);
      if (!troop) {
        errorResponse(res, 'Troop not found', 404);
        return;
      }

      const reactivatedTroop = await TroopService.updateTroop(id, { status: 'ACTIVE' });

      successResponse(res, 'Troop reactivated successfully', reactivatedTroop);
    } catch (error: any) {
      console.error('Reactivate troop error:', error);
      errorResponse(res, 'Failed to reactivate troop: ' + error.message, 500);
    }
  }
}