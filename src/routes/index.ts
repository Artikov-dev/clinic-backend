import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import appointmentsRoutes from './appointments.routes';
import { medicalRecordsRouter, prescriptionsRouter, paymentsRouter } from './medical.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/appointments', appointmentsRoutes);
router.use('/medical-records', medicalRecordsRouter);
router.use('/prescriptions', prescriptionsRouter);
router.use('/payments', paymentsRouter);

export default router;
