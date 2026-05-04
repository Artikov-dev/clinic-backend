import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { sendSuccess, asyncHandler } from '../utils/apiResponse';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  sendSuccess(res, result, 'User registered successfully', 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  sendSuccess(res, result, 'Login successful');
});

export const getRoles = asyncHandler(async (_req: Request, res: Response) => {
  const data = await authService.getRoles();
  sendSuccess(res, data, 'Roles retrieved');
});
