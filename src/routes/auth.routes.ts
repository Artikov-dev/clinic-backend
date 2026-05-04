import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { registerValidator, loginValidator } from '../validators/auth.validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [full_name, email, password]
 *             properties:
 *               full_name: { type: string, example: "Ali Valiyev" }
 *               email: { type: string, example: "ali@clinic.com" }
 *               password: { type: string, example: "secret123" }
 *               role_name:
 *                 type: string
 *                 enum: [admin, doctor, patient, reception]
 *                 example: patient
 *                 description: Recommended. Static role name.
 *               role_id:
 *                 type: string
 *                 format: uuid
 *                 description: Role UUID from GET /api/auth/roles
 *           examples:
 *             registerWithRoleName:
 *               summary: Register with role name
 *               value:
 *                 full_name: "Ali Valiyev"
 *                 email: "ali@clinic.com"
 *                 password: "secret123"
 *                 role_name: "patient"
 *     responses:
 *       201: { description: User registered }
 *       409: { description: Email already exists }
 */
router.post('/register', registerValidator, validate, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "admin@clinic.com" }
 *               password: { type: string, example: "secret123" }
 *     responses:
 *       200: { description: Login successful with JWT token }
 *       401: { description: Invalid credentials }
 */
router.post('/login', loginValidator, validate, authController.login);

/**
 * @swagger
 * /api/auth/roles:
 *   get:
 *     tags: [Auth]
 *     summary: Get all roles
 *     responses:
 *       200: { description: List of roles }
 */
router.get('/roles', authController.getRoles);

export default router;
