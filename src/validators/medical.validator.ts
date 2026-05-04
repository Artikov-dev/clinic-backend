import { body, param } from 'express-validator';

export const createPaymentValidator = [
  body('appointment_id').isUUID().withMessage('Valid appointment ID required'),
  body('patient_id').isUUID().withMessage('Valid patient ID required'),
  body('amount')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Valid amount required')
    .custom((val) => {
      if (parseFloat(val) <= 0) throw new Error('Amount must be greater than 0');
      return true;
    }),
  body('payment_method')
    .optional()
    .isIn(['cash', 'card', 'online'])
    .withMessage('Invalid payment method'),
];

export const createPrescriptionValidator = [
  body('appointment_id').isUUID(),
  body('patient_id').isUUID(),
  body('medicine_name').trim().notEmpty().isLength({ max: 255 }),
  body('dosage').trim().notEmpty().isLength({ max: 255 }),
  body('instructions').optional().trim(),
];

export const createMedicalRecordValidator = [
  body('patient_id').isUUID(),
  body('appointment_id').optional().isUUID(),
  body('notes').trim().notEmpty().withMessage('Notes are required'),
];
