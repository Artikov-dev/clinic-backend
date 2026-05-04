import { body, oneOf, param } from 'express-validator';

export const registerValidator = [
  body('full_name').trim().notEmpty().withMessage('Full name is required').isLength({ min: 2, max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  oneOf(
    [
      body('role_id').isUUID().withMessage('Valid role ID is required'),
      body('role_name')
        .isIn(['admin', 'doctor', 'patient', 'reception'])
        .withMessage('Valid role name is required'),
    ],
    { message: 'Either role_id or role_name is required' }
  ),
];

export const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const uuidParamValidator = [
  param('id').isUUID().withMessage('Valid UUID is required'),
];
