import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiResponse';
import { config } from '../config/env';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(config.isDev && { stack: err.stack }),
    });
    return;
  }

  // PostgreSQL unique violation
  if ((err as any).code === '23505') {
    res.status(409).json({ success: false, message: 'Resource already exists' });
    return;
  }

  // PostgreSQL foreign key violation
  if ((err as any).code === '23503') {
    res.status(400).json({ success: false, message: 'Referenced resource not found' });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(config.isDev && { stack: err.stack }),
  });
};

export const notFoundMiddleware = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};
