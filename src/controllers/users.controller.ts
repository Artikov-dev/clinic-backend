import { Response, NextFunction } from 'express';
import usersService from '../services/users.service';
import { sendSuccess, asyncHandler } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export const getDoctors = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await usersService.getAllDoctors(req.query as any);
  sendSuccess(res, data, 'Doctors retrieved');
});

export const getPatients = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await usersService.getAllPatients(req.query as any);
  sendSuccess(res, data, 'Patients retrieved');
});

export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await usersService.getUserById(req.params.id);
  sendSuccess(res, data, 'User retrieved');
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await usersService.getUserById(req.user!.userId);
  sendSuccess(res, data, 'Profile retrieved');
});

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await usersService.updateUser(req.params.id, req.body);
  sendSuccess(res, data, 'User updated');
});

export const deactivateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  await usersService.deactivateUser(req.params.id);
  sendSuccess(res, null, 'User deactivated');
});
