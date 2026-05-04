import { Router } from 'express';
import * as ctrl from '../controllers/appointments.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  createAppointmentValidator,
  updateAppointmentValidator,
  appointmentQueryValidator,
} from '../validators/appointment.validator';
import { uuidParamValidator } from '../validators/auth.validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     tags: [Appointments]
 *     summary: Create appointment (Reception)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patient_id, doctor_id, appointment_date]
 *             properties:
 *               patient_id: { type: string, format: uuid }
 *               doctor_id: { type: string, format: uuid }
 *               appointment_date: { type: string, format: date-time }
 *     responses:
 *       201: { description: Appointment created }
 */
router.post('/', authorize('reception', 'admin'), createAppointmentValidator, validate, ctrl.createAppointment);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: Get all appointments (Admin, Reception)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, confirmed, cancelled, completed] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Paginated appointments }
 */
router.get('/', authorize('admin', 'reception'), appointmentQueryValidator, validate, ctrl.getAllAppointments);

/**
 * @swagger
 * /api/appointments/my:
 *   get:
 *     tags: [Appointments]
 *     summary: Get my appointments (Doctor or Patient)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: My appointments }
 */
router.get('/my', authorize('doctor', 'patient'), ctrl.getMyAppointments);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     tags: [Appointments]
 *     summary: Get appointment by ID
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:id', uuidParamValidator, validate, ctrl.getAppointmentById);

/**
 * @swagger
 * /api/appointments/{id}:
 *   patch:
 *     tags: [Appointments]
 *     summary: Update appointment (Admin, Reception)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [pending, confirmed, cancelled, completed] }
 *               appointment_date: { type: string, format: date-time }
 */
router.patch('/:id', authorize('admin', 'reception'), updateAppointmentValidator, validate, ctrl.updateAppointment);

/**
 * @swagger
 * /api/appointments/{id}/cancel:
 *   patch:
 *     tags: [Appointments]
 *     summary: Cancel appointment (Admin, Reception)
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:id/cancel', authorize('admin', 'reception'), uuidParamValidator, validate, ctrl.cancelAppointment);

export default router;
