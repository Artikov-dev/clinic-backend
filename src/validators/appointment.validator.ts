import { body, param, query } from 'express-validator';

export const createAppointmentValidator = [
  body('patient_id').isUUID().withMessage('Valid patient ID required'),
  body('doctor_id').isUUID().withMessage('Valid doctor ID required'),
  body('appointment_date')
    .isISO8601()
    .withMessage('Valid appointment date required (ISO 8601)')
    .custom((val) => {
      if (new Date(val) <= new Date()) throw new Error('Appointment date must be in the future');
      return true;
    }),
];

export const updateAppointmentValidator = [
  param('id').isUUID(),
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Invalid status'),
  body('appointment_date').optional().isISO8601(),
];

export const appointmentQueryValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed']),
];
