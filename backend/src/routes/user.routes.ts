import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Validation schemas
const addUserToTroopSchema = z.object({
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
    troopId: z.string().uuid('Invalid troop ID'),
    role: z.enum(['SCOUTMASTER', 'ASSISTANT_SCOUTMASTER', 'COMMITTEE_CHAIR', 'COMMITTEE_MEMBER', 'PARENT', 'CHARTERED_ORG_REP', 'YOUTH_LEADER', 'ADMIN'])
  })
});

const updateBackgroundCheckSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'APPROVED', 'DENIED', 'EXPIRED']),
    date: z.string().optional()
  })
});

const updateYouthProtectionSchema = z.object({
  body: z.object({
    date: z.string()
  })
});

// Protected routes (all require authentication)
router.use(authenticate);

// User management
router.get('/', UserController.getAllUsers);
router.get('/dashboard', UserController.getDashboard);
router.get('/:id', UserController.getUserById);
router.get('/:id/scouts', UserController.getUserWithScouts);
router.get('/:id/troops', UserController.getUserTroops);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

// Troop membership management
router.post('/troop-membership', validateRequest(addUserToTroopSchema), UserController.addUserToTroop);
router.delete('/:userId/troop/:troopId', UserController.removeUserFromTroop);

// Background check and training management
router.put('/:id/background-check', validateRequest(updateBackgroundCheckSchema), UserController.updateBackgroundCheckStatus);
router.put('/:id/youth-protection', validateRequest(updateYouthProtectionSchema), UserController.updateYouthProtectionStatus);

export default router;