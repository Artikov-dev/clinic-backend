import { Router } from 'express';
import * as ctrl from '../controllers/medical.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  createMedicalRecordValidator,
  createPrescriptionValidator,
  createPaymentValidator,
} from '../validators/medical.validator';
import { uuidParamValidator } from '../validators/auth.validator';
import { validate } from '../middlewares/validate.middleware';

// ─── MEDICAL RECORDS ──────────────────────────────────────────────────────────
export const medicalRecordsRouter = Router();
medicalRecordsRouter.use(authenticate);

/**
 * @swagger
 * /api/medical-records:
 *   post:
 *     tags: [Medical Records]
 *     summary: Create medical record (Doctor)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patient_id, notes]
 *             properties:
 *               patient_id: { type: string, format: uuid }
 *               appointment_id: { type: string, format: uuid }
 *               notes: { type: string }
 */
medicalRecordsRouter.post('/', authorize('doctor'), createMedicalRecordValidator, validate, ctrl.createMedicalRecord);

/**
 * @swagger
 * /api/medical-records/my:
 *   get:
 *     tags: [Medical Records]
 *     summary: Get my medical records (Patient)
 *     security: [{ bearerAuth: [] }]
 */
medicalRecordsRouter.get('/my', authorize('patient'), ctrl.getMyMedicalRecords);

/**
 * @swagger
 * /api/medical-records/doctor:
 *   get:
 *     tags: [Medical Records]
 *     summary: Get my created records (Doctor)
 *     security: [{ bearerAuth: [] }]
 */
medicalRecordsRouter.get('/doctor', authorize('doctor'), ctrl.getDoctorMedicalRecords);

/**
 * @swagger
 * /api/medical-records/patient/{patientId}:
 *   get:
 *     tags: [Medical Records]
 *     summary: Get records by patient (Doctor, Admin)
 *     security: [{ bearerAuth: [] }]
 */
medicalRecordsRouter.get('/patient/:patientId', authorize('doctor', 'admin'), ctrl.getMyMedicalRecords);

medicalRecordsRouter.get('/:id', uuidParamValidator, validate, ctrl.getMedicalRecordById);
medicalRecordsRouter.patch('/:id', authorize('doctor'), uuidParamValidator, validate, ctrl.updateMedicalRecord);

// ─── PRESCRIPTIONS ────────────────────────────────────────────────────────────
export const prescriptionsRouter = Router();
prescriptionsRouter.use(authenticate);

/**
 * @swagger
 * /api/prescriptions:
 *   post:
 *     tags: [Prescriptions]
 *     summary: Create prescription (Doctor)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [appointment_id, patient_id, medicine_name, dosage]
 *             properties:
 *               appointment_id: { type: string, format: uuid }
 *               patient_id: { type: string, format: uuid }
 *               medicine_name: { type: string }
 *               dosage: { type: string }
 *               instructions: { type: string }
 */
prescriptionsRouter.post('/', authorize('doctor'), createPrescriptionValidator, validate, ctrl.createPrescription);

/**
 * @swagger
 * /api/prescriptions/my:
 *   get:
 *     tags: [Prescriptions]
 *     summary: Get my prescriptions (Patient)
 *     security: [{ bearerAuth: [] }]
 */
prescriptionsRouter.get('/my', authorize('patient'), ctrl.getMyPrescriptions);
prescriptionsRouter.get('/doctor', authorize('doctor'), ctrl.getDoctorPrescriptions);
prescriptionsRouter.get('/patient/:patientId', authorize('doctor', 'admin'), ctrl.getMyPrescriptions);
prescriptionsRouter.get('/:id', uuidParamValidator, validate, ctrl.getPrescriptionById);

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
export const paymentsRouter = Router();
paymentsRouter.use(authenticate);

/**
 * @swagger
 * /api/payments:
 *   post:
 *     tags: [Payments]
 *     summary: Create payment (Reception)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [appointment_id, patient_id, amount]
 *             properties:
 *               appointment_id: { type: string, format: uuid }
 *               patient_id: { type: string, format: uuid }
 *               amount: { type: number, example: 150000.00 }
 *               payment_method: { type: string, enum: [cash, card, online] }
 */
paymentsRouter.post('/', authorize('reception', 'admin'), createPaymentValidator, validate, ctrl.createPayment);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     tags: [Payments]
 *     summary: Get all payments (Admin)
 *     security: [{ bearerAuth: [] }]
 */
paymentsRouter.get('/', authorize('admin'), ctrl.getAllPayments);

/**
 * @swagger
 * /api/payments/my:
 *   get:
 *     tags: [Payments]
 *     summary: Get my payments (Patient)
 *     security: [{ bearerAuth: [] }]
 */
paymentsRouter.get('/my', authorize('patient'), ctrl.getMyPayments);

/**
 * @swagger
 * /api/payments/{id}/pay:
 *   patch:
 *     tags: [Payments]
 *     summary: Mark payment as paid (Reception, Admin)
 *     security: [{ bearerAuth: [] }]
 */
paymentsRouter.patch('/:id/pay', authorize('reception', 'admin'), uuidParamValidator, validate, ctrl.markPaymentAsPaid);
