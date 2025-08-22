import { Router } from 'express';
import { ScoutController } from '../controllers/scout.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createScoutSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['MALE', 'FEMALE']),
    address: z.object({
      street: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      zipCode: z.string().min(1, 'Zip code is required')
    }),
    school: z.object({
      name: z.string().min(1, 'School name is required'),
      grade: z.string().min(1, 'Grade is required')
    }),
    emergencyContacts: z.array(z.object({
      name: z.string().min(1, 'Contact name is required'),
      relationship: z.string().min(1, 'Relationship is required'),
      phone: z.string().min(1, 'Phone is required'),
      email: z.string().email('Invalid email format').optional()
    })).min(1, 'At least one emergency contact is required'),
    medicalInfo: z.object({
      allergies: z.array(z.string()).optional(),
      medications: z.array(z.string()).optional(),
      conditions: z.array(z.string()).optional()
    }).optional(),
    photoConsent: z.boolean().optional(),
    photoUrl: z.string().url().optional(),
    currentRank: z.enum(['SCOUT', 'TENDERFOOT', 'SECOND_CLASS', 'FIRST_CLASS', 'STAR', 'LIFE', 'EAGLE']).optional(),
    troopId: z.string().uuid('Invalid troop ID'),
    parentId: z.string().uuid('Invalid parent ID')
  })
});

const updateScoutSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE']).optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional()
    }).optional(),
    school: z.object({
      name: z.string().optional(),
      grade: z.string().optional()
    }).optional(),
    emergencyContacts: z.array(z.object({
      name: z.string().min(1),
      relationship: z.string().min(1),
      phone: z.string().min(1),
      email: z.string().email().optional()
    })).optional(),
    medicalInfo: z.object({
      allergies: z.array(z.string()).optional(),
      medications: z.array(z.string()).optional(),
      conditions: z.array(z.string()).optional()
    }).optional(),
    photoConsent: z.boolean().optional(),
    photoUrl: z.string().url().optional(),
    currentRank: z.enum(['SCOUT', 'TENDERFOOT', 'SECOND_CLASS', 'FIRST_CLASS', 'STAR', 'LIFE', 'EAGLE']).optional()
  })
});

const addRankAdvancementSchema = z.object({
  body: z.object({
    rank: z.enum(['SCOUT', 'TENDERFOOT', 'SECOND_CLASS', 'FIRST_CLASS', 'STAR', 'LIFE', 'EAGLE']),
    awardedDate: z.string(),
    boardDate: z.string().optional(),
    boardMembers: z.array(z.string()).optional()
  })
});

const startMeritBadgeSchema = z.object({
  body: z.object({
    badgeId: z.string().uuid('Invalid badge ID'),
    counselor: z.string().optional()
  })
});

// Protected routes (all require authentication)
router.use(authenticate);

// Scout management
router.get('/', ScoutController.getScouts);
router.get('/my', ScoutController.getMyScouts);
router.post('/', validateRequest(createScoutSchema), ScoutController.createScout);

router.get('/:id', ScoutController.getScoutById);
router.put('/:id', validateRequest(updateScoutSchema), ScoutController.updateScout);
router.delete('/:id', ScoutController.deleteScout);

// Scout advancement and badges
router.get('/:id/ranks', ScoutController.getScoutWithRankHistory);
router.post('/:id/ranks', validateRequest(addRankAdvancementSchema), ScoutController.addRankAdvancement);

router.get('/:id/merit-badges', ScoutController.getScoutWithMeritBadges);
router.post('/:id/merit-badges', validateRequest(startMeritBadgeSchema), ScoutController.startMeritBadge);
router.put('/:id/merit-badges/:badgeId/complete', ScoutController.completeMeritBadge);

/**
 * @swagger
 * /scouts/merit-badges/catalog:
 *   get:
 *     summary: Get merit badge catalog
 *     tags: [Merit Badges]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve the complete catalog of available merit badges
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (optional)
 *         example: Outdoor
 *     responses:
 *       200:
 *         description: Merit badges retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Merit badges retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MeritBadge'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /scouts/my:
 *   get:
 *     summary: Get my scouts (for parents)
 *     tags: [Scouts]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve all scouts that belong to the current user (parent)
 *     responses:
 *       200:
 *         description: My scouts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: My scouts retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Scout'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /scouts:
 *   get:
 *     summary: Get scouts by troop or parent
 *     tags: [Scouts]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve scouts filtered by troop ID or parent ID
 *     parameters:
 *       - in: query
 *         name: troopId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by troop ID
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by parent ID
 *     responses:
 *       200:
 *         description: Scouts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Scouts retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Scout'
 *       400:
 *         description: Either troopId or parentId query parameter is required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /scouts:
 *   post:
 *     summary: Create a new scout
 *     tags: [Scouts]
 *     security:
 *       - bearerAuth: []
 *     description: Register a new scout to a troop
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateScoutRequest'
 *     responses:
 *       201:
 *         description: Scout created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Scout created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Scout'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.get('/merit-badges/catalog', ScoutController.getAllMeritBadges);

export default router;