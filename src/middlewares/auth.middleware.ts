import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/apiResponse';
import { AuthRequest, RoleName } from '../types';

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }
    const token = authHeader.split(' ')[1];
    req.user = verifyToken(token);
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    next(new ApiError(401, 'Invalid or expired token'));
  }
};

export const authorize = (...roles: RoleName[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new ApiError(401, 'Not authenticated'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Access forbidden: insufficient permissions'));
    }
    next();
  };
};
