import { Router } from 'express';
import { TroopController } from '../controllers/troop.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createTroopSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Troop name is required'),
    description: z.string().optional(),
    address: z.object({
      street: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      zipCode: z.string().min(1, 'Zip code is required')
    }),
    charterOrganization: z.string().min(1, 'Charter organization is required'),
    meetingSchedule: z.string().min(1, 'Meeting schedule is required'),
    meetingLocation: z.string().min(1, 'Meeting location is required'),
    contactEmail: z.string().email('Invalid email format'),
    contactPhone: z.string().min(1, 'Contact phone is required'),
    foundedDate: z.string().optional(),
    troopSizeLimit: z.number().positive().optional()
  })
});

const updateTroopSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional()
    }).optional(),
    charterOrganization: z.string().min(1).optional(),
    meetingSchedule: z.string().min(1).optional(),
    meetingLocation: z.string().min(1).optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().min(1).optional(),
    foundedDate: z.string().optional(),
    troopSizeLimit: z.number().positive().optional()
  })
});

const addMemberSchema = z.object({
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
    role: z.enum(['SCOUTMASTER', 'ASSISTANT_SCOUTMASTER', 'COMMITTEE_CHAIR', 'COMMITTEE_MEMBER', 'PARENT', 'CHARTERED_ORG_REP', 'YOUTH_LEADER', 'ADMIN'])
  })
});

/**
 * @swagger
 * /troops:
 *   get:
 *     summary: Get all active troops
 *     tags: [Troops]
 *     description: Retrieve a list of all active scout troops. This endpoint is public and doesn't require authentication.
 *     responses:
 *       200:
 *         description: Troops retrieved successfully
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
 *                   example: Troops retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Troop'
 */
router.get('/', TroopController.getAllTroops);

/**
 * @swagger
 * /troops/{id}:
 *   get:
 *     summary: Get troop by ID
 *     tags: [Troops]
 *     description: Retrieve detailed information about a specific troop
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The troop ID
 *         example: 26832f33-d041-49ad-90ba-487aeb43c0aa
 *     responses:
 *       200:
 *         description: Troop retrieved successfully
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
 *                   example: Troop retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Troop'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', TroopController.getTroopById);

// Protected routes (require authentication)
router.use(authenticate);

/**
 * @swagger
 * /troops:
 *   post:
 *     summary: Create a new troop
 *     tags: [Troops]
 *     security:
 *       - bearerAuth: []
 *     description: Create a new scout troop. The authenticated user becomes the Scoutmaster.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTroopRequest'
 *     responses:
 *       201:
 *         description: Troop created successfully
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
 *                   example: Troop created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Troop'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', validateRequest(createTroopSchema), TroopController.createTroop);

/**
 * @swagger
 * /troops/{id}:
 *   put:
 *     summary: Update troop information
 *     tags: [Troops]
 *     security:
 *       - bearerAuth: []
 *     description: Update troop details. Only accessible by troop leaders.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The troop ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Troop Name
 *               description:
 *                 type: string
 *                 example: Updated description
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *               meetingSchedule:
 *                 type: string
 *                 example: Wednesdays 7:00 PM
 *               meetingLocation:
 *                 type: string
 *                 example: Updated Meeting Location
 *               contactEmail:
 *                 type: string
 *                 format: email
 *               contactPhone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Troop updated successfully
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
 *                   example: Troop updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Troop'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', validateRequest(updateTroopSchema), TroopController.updateTroop);

/**
 * @swagger
 * /troops/my/troops:
 *   get:
 *     summary: Get current user's troops
 *     tags: [Troops]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve all troops that the current user is a member of
 *     responses:
 *       200:
 *         description: User troops retrieved successfully
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
 *                   example: User troops retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Troop'
 *                       - type: object
 *                         properties:
 *                           user_troop_roles:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 role:
 *                                   type: string
 *                                   example: SCOUTMASTER
 *                                 user_id:
 *                                   type: string
 *                                   format: uuid
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/my/troops', TroopController.getMyTroops);

/**
 * @swagger
 * /troops/{id}/members:
 *   get:
 *     summary: Get troop with members
 *     tags: [Troops]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve troop information along with all members and scouts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The troop ID
 *     responses:
 *       200:
 *         description: Troop with members retrieved successfully
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
 *                   example: Troop with members retrieved successfully
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Troop'
 *                     - type: object
 *                       properties:
 *                         user_troop_roles:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               role:
 *                                 type: string
 *                                 example: SCOUTMASTER
 *                               users:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                     format: uuid
 *                                   email:
 *                                     type: string
 *                                   first_name:
 *                                     type: string
 *                                   last_name:
 *                                     type: string
 *                         scouts:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               first_name:
 *                                 type: string
 *                               last_name:
 *                                 type: string
 *                               current_rank:
 *                                 type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id/members', TroopController.getTroopWithMembers);

/**
 * @swagger
 * /troops/{id}/stats:
 *   get:
 *     summary: Get troop statistics
 *     tags: [Troops]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve comprehensive statistics about the troop
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The troop ID
 *     responses:
 *       200:
 *         description: Troop statistics retrieved successfully
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
 *                   example: Troop statistics retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/TroopStats'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id/stats', TroopController.getTroopStats);

/**
 * @swagger
 * /troops/{id}/members:
 *   post:
 *     summary: Add member to troop
 *     tags: [Troops]
 *     security:
 *       - bearerAuth: []
 *     description: Add a user to the troop with a specific role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The troop ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, role]
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: e29490e4-5523-4096-8f26-28c541ff4f86
 *               role:
 *                 type: string
 *                 enum: [SCOUTMASTER, ASSISTANT_SCOUTMASTER, COMMITTEE_CHAIR, COMMITTEE_MEMBER, PARENT, CHARTERED_ORG_REP, YOUTH_LEADER, ADMIN]
 *                 example: PARENT
 *     responses:
 *       200:
 *         description: Member added to troop successfully
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
 *                   example: Member added to troop successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/members', validateRequest(addMemberSchema), TroopController.addMemberToTroop);

/**
 * @swagger
 * /troops/{id}/members/{userId}:
 *   delete:
 *     summary: Remove member from troop
 *     tags: [Troops]
 *     security:
 *       - bearerAuth: []
 *     description: Remove a user from the troop
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The troop ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user ID to remove
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [SCOUTMASTER, ASSISTANT_SCOUTMASTER, COMMITTEE_CHAIR, COMMITTEE_MEMBER, PARENT, CHARTERED_ORG_REP, YOUTH_LEADER, ADMIN]
 *         description: Specific role to remove (optional)
 *     responses:
 *       200:
 *         description: Member removed from troop successfully
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
 *                   example: Member removed from troop successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id/members/:userId', TroopController.removeMemberFromTroop);

/**
 * @swagger
 * /troops/{id}/archive:
 *   put:
 *     summary: Archive troop
 *     tags: [Troops]
 *     security:
 *       - bearerAuth: []
 *     description: Archive a troop (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The troop ID
 *     responses:
 *       200:
 *         description: Troop archived successfully
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
 *                   example: Troop archived successfully
 *                 data:
 *                   $ref: '#/components/schemas/Troop'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id/archive', TroopController.archiveTroop);

/**
 * @swagger
 * /troops/{id}/reactivate:
 *   put:
 *     summary: Reactivate troop
 *     tags: [Troops]
 *     security:
 *       - bearerAuth: []
 *     description: Reactivate an archived troop
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The troop ID
 *     responses:
 *       200:
 *         description: Troop reactivated successfully
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
 *                   example: Troop reactivated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Troop'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id/reactivate', TroopController.reactivateTroop);

export default router;