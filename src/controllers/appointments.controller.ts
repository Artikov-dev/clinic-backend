import { Response } from 'express';
import appointmentsService from '../services/appointments.service';
import { sendSuccess, asyncHandler } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export const createAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await appointmentsService.create(req.body);
  sendSuccess(res, data, 'Appointment created', 201);
});

export const getAllAppointments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await appointmentsService.getAll(req.query as any);
  sendSuccess(res, data, 'Appointments retrieved');
});

export const getMyAppointments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const role = req.user!.role;
  const userId = req.user!.userId;
  const data =
    role === 'doctor'
      ? await appointmentsService.getByDoctor(userId, req.query as any)
      : await appointmentsService.getByPatient(userId, req.query as any);
  sendSuccess(res, data, 'Appointments retrieved');
});

export const getAppointmentById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await appointmentsService.getById(req.params.id);
  sendSuccess(res, data, 'Appointment retrieved');
});

export const updateAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await appointmentsService.update(req.params.id, req.body);
  sendSuccess(res, data, 'Appointment updated');
});

export const cancelAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await appointmentsService.cancel(req.params.id);
  sendSuccess(res, data, 'Appointment cancelled');
});
