import { Router } from 'express';
import * as usersController from '../controllers/users.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uuidParamValidator } from '../validators/auth.validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User profile }
 */
router.get('/me', usersController.getMe);

/**
 * @swagger
 * /api/users/doctors:
 *   get:
 *     tags: [Users]
 *     summary: Get all doctors (Admin, Reception)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated list of doctors }
 */
router.get('/doctors', authorize('admin', 'reception'), usersController.getDoctors);

/**
 * @swagger
 * /api/users/patients:
 *   get:
 *     tags: [Users]
 *     summary: Get all patients (Admin, Doctor, Reception)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated list of patients }
 */
router.get('/patients', authorize('admin', 'doctor', 'reception'), usersController.getPatients);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: User found }
 *       404: { description: User not found }
 */
router.get('/:id', authorize('admin'), uuidParamValidator, validate, usersController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update user (Admin)
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:id', authorize('admin'), uuidParamValidator, validate, usersController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Deactivate user (Admin)
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:id', authorize('admin'), uuidParamValidator, validate, usersController.deactivateUser);

export default router;
