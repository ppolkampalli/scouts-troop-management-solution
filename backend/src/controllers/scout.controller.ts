import { Request, Response } from 'express';
import { ScoutService } from '../services/scout.service';
import { successResponse, errorResponse } from '../utils/response';

export class ScoutController {
  // Get all scouts (by troop or parent)
  static async getScouts(req: Request, res: Response): Promise<void> {
    try {
      const { troopId, parentId } = req.query;

      let scouts;

      if (troopId) {
        scouts = await ScoutService.getScoutsByTroopId(troopId as string);
      } else if (parentId) {
        scouts = await ScoutService.getScoutsByParentId(parentId as string);
      } else {
        errorResponse(res, 'Either troopId or parentId query parameter is required', 400);
        return;
      }

      successResponse(res, 'Scouts retrieved successfully', scouts);
    } catch (error: any) {
      console.error('Get scouts error:', error);
      errorResponse(res, 'Failed to get scouts: ' + error.message, 500);
    }
  }

  // Get scout by ID
  static async getScoutById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const scout = await ScoutService.findScoutById(id);
      if (!scout) {
        errorResponse(res, 'Scout not found', 404);
        return;
      }

      successResponse(res, 'Scout retrieved successfully', scout);
    } catch (error: any) {
      console.error('Get scout by ID error:', error);
      errorResponse(res, 'Failed to get scout: ' + error.message, 500);
    }
  }

  // Get scout with rank history
  static async getScoutWithRankHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const scoutWithRanks = await ScoutService.getScoutWithRankHistory(id);
      if (!scoutWithRanks) {
        errorResponse(res, 'Scout not found', 404);
        return;
      }

      successResponse(res, 'Scout with rank history retrieved successfully', scoutWithRanks);
    } catch (error: any) {
      console.error('Get scout with rank history error:', error);
      errorResponse(res, 'Failed to get scout with rank history: ' + error.message, 500);
    }
  }

  // Get scout with merit badges
  static async getScoutWithMeritBadges(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const scoutWithBadges = await ScoutService.getScoutWithMeritBadges(id);
      if (!scoutWithBadges) {
        errorResponse(res, 'Scout not found', 404);
        return;
      }

      successResponse(res, 'Scout with merit badges retrieved successfully', scoutWithBadges);
    } catch (error: any) {
      console.error('Get scout with merit badges error:', error);
      errorResponse(res, 'Failed to get scout with merit badges: ' + error.message, 500);
    }
  }

  // Create new scout
  static async createScout(req: Request, res: Response): Promise<void> {
    try {
      const scoutData = req.body;

      // Format field names to match database schema
      const {
        firstName,
        lastName,
        dateOfBirth,
        emergencyContacts,
        photoConsent,
        photoUrl,
        currentRank,
        troopId,
        parentId,
        medicalInfo,
        ...baseData
      } = scoutData;

      const formattedScoutData = {
        ...baseData,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: new Date(dateOfBirth).toISOString(),
        emergency_contacts: emergencyContacts,
        photo_consent: photoConsent || false,
        photo_url: photoUrl,
        current_rank: currentRank || 'SCOUT',
        troop_id: troopId,
        parent_id: parentId,
        medical_info: medicalInfo
      };

      const newScout = await ScoutService.createScout(formattedScoutData);

      successResponse(res, 'Scout created successfully', newScout, 201);
    } catch (error: any) {
      console.error('Create scout error:', error);
      errorResponse(res, 'Failed to create scout: ' + error.message, 500);
    }
  }

  // Update scout
  static async updateScout(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if scout exists
      const existingScout = await ScoutService.findScoutById(id);
      if (!existingScout) {
        errorResponse(res, 'Scout not found', 404);
        return;
      }

      // Format field names to match database schema
      const {
        firstName,
        lastName,
        dateOfBirth,
        emergencyContacts,
        photoConsent,
        photoUrl,
        currentRank,
        medicalInfo,
        ...baseData
      } = updateData;

      const formattedUpdateData = {
        ...baseData,
        ...(firstName && { first_name: firstName }),
        ...(lastName && { last_name: lastName }),
        ...(dateOfBirth && { date_of_birth: new Date(dateOfBirth).toISOString() }),
        ...(emergencyContacts && { emergency_contacts: emergencyContacts }),
        ...(photoConsent !== undefined && { photo_consent: photoConsent }),
        ...(photoUrl && { photo_url: photoUrl }),
        ...(currentRank && { current_rank: currentRank }),
        ...(medicalInfo && { medical_info: medicalInfo })
      };

      const updatedScout = await ScoutService.updateScout(id, formattedUpdateData);

      successResponse(res, 'Scout updated successfully', updatedScout);
    } catch (error: any) {
      console.error('Update scout error:', error);
      errorResponse(res, 'Failed to update scout: ' + error.message, 500);
    }
  }

  // Delete scout
  static async deleteScout(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if scout exists
      const scout = await ScoutService.findScoutById(id);
      if (!scout) {
        errorResponse(res, 'Scout not found', 404);
        return;
      }

      await ScoutService.deleteScout(id);

      successResponse(res, 'Scout deleted successfully');
    } catch (error: any) {
      console.error('Delete scout error:', error);
      errorResponse(res, 'Failed to delete scout: ' + error.message, 500);
    }
  }

  // Add rank advancement
  static async addRankAdvancement(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { rank, awardedDate, boardDate, boardMembers } = req.body;

      // Check if scout exists
      const scout = await ScoutService.findScoutById(id);
      if (!scout) {
        errorResponse(res, 'Scout not found', 404);
        return;
      }

      const rankData = {
        rank,
        awarded_date: new Date(awardedDate).toISOString(),
        board_date: boardDate ? new Date(boardDate).toISOString() : null,
        board_members: boardMembers
      };

      const advancement = await ScoutService.addRankAdvancement(id, rankData);

      successResponse(res, 'Rank advancement added successfully', advancement, 201);
    } catch (error: any) {
      console.error('Add rank advancement error:', error);
      errorResponse(res, 'Failed to add rank advancement: ' + error.message, 500);
    }
  }

  // Start merit badge progress
  static async startMeritBadge(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { badgeId, counselor } = req.body;

      // Check if scout exists
      const scout = await ScoutService.findScoutById(id);
      if (!scout) {
        errorResponse(res, 'Scout not found', 404);
        return;
      }

      const meritBadgeProgress = await ScoutService.startMeritBadge(id, badgeId, counselor);

      successResponse(res, 'Merit badge progress started successfully', meritBadgeProgress, 201);
    } catch (error: any) {
      console.error('Start merit badge error:', error);
      errorResponse(res, 'Failed to start merit badge: ' + error.message, 500);
    }
  }

  // Complete merit badge
  static async completeMeritBadge(req: Request, res: Response): Promise<void> {
    try {
      const { id, badgeId } = req.params;

      // Check if scout exists
      const scout = await ScoutService.findScoutById(id);
      if (!scout) {
        errorResponse(res, 'Scout not found', 404);
        return;
      }

      const completedBadge = await ScoutService.completeMeritBadge(id, badgeId);

      successResponse(res, 'Merit badge completed successfully', completedBadge);
    } catch (error: any) {
      console.error('Complete merit badge error:', error);
      errorResponse(res, 'Failed to complete merit badge: ' + error.message, 500);
    }
  }

  // Get all merit badges
  static async getAllMeritBadges(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;

      let meritBadges;

      if (category) {
        meritBadges = await ScoutService.getMeritBadgesByCategory(category as string);
      } else {
        meritBadges = await ScoutService.getAllMeritBadges();
      }

      successResponse(res, 'Merit badges retrieved successfully', meritBadges);
    } catch (error: any) {
      console.error('Get merit badges error:', error);
      errorResponse(res, 'Failed to get merit badges: ' + error.message, 500);
    }
  }

  // Get my scouts (for parent users)
  static async getMyScouts(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        errorResponse(res, 'User not authenticated', 401);
        return;
      }

      const scouts = await ScoutService.getScoutsByParentId(userId);

      successResponse(res, 'My scouts retrieved successfully', scouts);
    } catch (error: any) {
      console.error('Get my scouts error:', error);
      errorResponse(res, 'Failed to get my scouts: ' + error.message, 500);
    }
  }
}