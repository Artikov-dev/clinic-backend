import { Response } from 'express';
import { medicalRecordsService, prescriptionsService, paymentsService } from '../services/medical.service';
import { sendSuccess, asyncHandler } from '../utils/apiResponse';
import { AuthRequest } from '../types';

// ─── MEDICAL RECORDS ──────────────────────────────────────────────────────────
export const createMedicalRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await medicalRecordsService.create(req.user!.userId, req.body);
  sendSuccess(res, data, 'Medical record created', 201);
});

export const getMyMedicalRecords = asyncHandler(async (req: AuthRequest, res: Response) => {
  const patientId = req.user!.role === 'patient' ? req.user!.userId : req.params.patientId;
  const data = await medicalRecordsService.getByPatient(patientId, req.query as any);
  sendSuccess(res, data, 'Medical records retrieved');
});

export const getDoctorMedicalRecords = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await medicalRecordsService.getByDoctor(req.user!.userId, req.query as any);
  sendSuccess(res, data, 'Medical records retrieved');
});

export const getMedicalRecordById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await medicalRecordsService.getById(req.params.id);
  sendSuccess(res, data, 'Medical record retrieved');
});

export const updateMedicalRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await medicalRecordsService.update(req.params.id, req.user!.userId, req.body.notes);
  sendSuccess(res, data, 'Medical record updated');
});

// ─── PRESCRIPTIONS ────────────────────────────────────────────────────────────
export const createPrescription = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await prescriptionsService.create(req.user!.userId, req.body);
  sendSuccess(res, data, 'Prescription created', 201);
});

export const getMyPrescriptions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const patientId = req.user!.role === 'patient' ? req.user!.userId : req.params.patientId;
  const data = await prescriptionsService.getByPatient(patientId, req.query as any);
  sendSuccess(res, data, 'Prescriptions retrieved');
});

export const getDoctorPrescriptions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await prescriptionsService.getByDoctor(req.user!.userId, req.query as any);
  sendSuccess(res, data, 'Prescriptions retrieved');
});

export const getPrescriptionById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await prescriptionsService.getById(req.params.id);
  sendSuccess(res, data, 'Prescription retrieved');
});

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
export const createPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await paymentsService.create(req.body);
  sendSuccess(res, data, 'Payment created', 201);
});

export const getAllPayments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await paymentsService.getAll(req.query as any);
  sendSuccess(res, data, 'Payments retrieved');
});

export const getMyPayments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await paymentsService.getByPatient(req.user!.userId, req.query as any);
  sendSuccess(res, data, 'Payments retrieved');
});

export const markPaymentAsPaid = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await paymentsService.markAsPaid(req.params.id);
  sendSuccess(res, data, 'Payment marked as paid');
});
