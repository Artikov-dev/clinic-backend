import { Response } from 'express';
import { ApiResponse } from '../types';

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500
): Response<ApiResponse> => {
  return res.status(statusCode).json({ success: false, message });
};

export const asyncHandler =
  (fn: Function) =>
  (...args: any[]) =>
    Promise.resolve(fn(...args)).catch(args[2]);
