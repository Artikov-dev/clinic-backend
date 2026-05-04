import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  decimal,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── ENUMS ────────────────────────────────────────────────────────────────────
export const appointmentStatusEnum = pgEnum('appointment_status', [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
]);

export const paymentStatusEnum = pgEnum('payment_status', ['paid', 'unpaid']);

// ─── ROLES ────────────────────────────────────────────────────────────────────
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 20 }).unique().notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// ─── USERS ────────────────────────────────────────────────────────────────────
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    full_name: varchar('full_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 100 }).unique().notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    role_id: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'restrict' }),
    deleted_at: timestamp('deleted_at'),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index('idx_users_email').on(table.email),
    roleIdx: index('idx_users_role').on(table.role_id),
  })
);

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
export const appointments = pgTable(
  'appointments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patient_id: uuid('patient_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    doctor_id: uuid('doctor_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    appointment_date: timestamp('appointment_date').notNull(),
    status: appointmentStatusEnum('status').default('pending').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    patientIdx: index('idx_appointments_patient').on(table.patient_id),
    doctorIdx: index('idx_appointments_doctor').on(table.doctor_id),
    statusIdx: index('idx_appointments_status').on(table.status),
    dateIdx: index('idx_appointments_date').on(table.appointment_date),
  })
);

// ─── MEDICAL RECORDS ──────────────────────────────────────────────────────────
export const medical_records = pgTable(
  'medical_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patient_id: uuid('patient_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    doctor_id: uuid('doctor_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    appointment_id: uuid('appointment_id').references(() => appointments.id, {
      onDelete: 'set null',
    }),
    notes: text('notes').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    patientIdx: index('idx_medical_patient').on(table.patient_id),
    doctorIdx: index('idx_medical_doctor').on(table.doctor_id),
  })
);

// ─── PRESCRIPTIONS ────────────────────────────────────────────────────────────
export const prescriptions = pgTable(
  'prescriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appointment_id: uuid('appointment_id')
      .notNull()
      .references(() => appointments.id, { onDelete: 'restrict' }),
    doctor_id: uuid('doctor_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    patient_id: uuid('patient_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    medicine_name: varchar('medicine_name', { length: 255 }).notNull(),
    dosage: varchar('dosage', { length: 255 }).notNull(),
    instructions: text('instructions'),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    patientIdx: index('idx_prescriptions_patient').on(table.patient_id),
    doctorIdx: index('idx_prescriptions_doctor').on(table.doctor_id),
    appointmentIdx: index('idx_prescriptions_appointment').on(
      table.appointment_id
    ),
  })
);

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appointment_id: uuid('appointment_id')
      .notNull()
      .references(() => appointments.id, { onDelete: 'restrict' }),
    patient_id: uuid('patient_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    status: paymentStatusEnum('status').default('unpaid').notNull(),
    payment_method: varchar('payment_method', { length: 20 })
      .default('cash')
      .notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    patientIdx: index('idx_payments_patient').on(table.patient_id),
    statusIdx: index('idx_payments_status').on(table.status),
    appointmentIdx: index('idx_payments_appointment').on(table.appointment_id),
  })
);

// ─── RELATIONS ────────────────────────────────────────────────────────────────
export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, { fields: [users.role_id], references: [roles.id] }),
  patientAppointments: many(appointments, { relationName: 'patientAppointments' }),
  doctorAppointments: many(appointments, { relationName: 'doctorAppointments' }),
  patientRecords: many(medical_records, { relationName: 'patientRecords' }),
  doctorRecords: many(medical_records, { relationName: 'doctorRecords' }),
  patientPrescriptions: many(prescriptions, { relationName: 'patientPrescriptions' }),
  doctorPrescriptions: many(prescriptions, { relationName: 'doctorPrescriptions' }),
  payments: many(payments),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(users, {
    fields: [appointments.patient_id],
    references: [users.id],
    relationName: 'patientAppointments',
  }),
  doctor: one(users, {
    fields: [appointments.doctor_id],
    references: [users.id],
    relationName: 'doctorAppointments',
  }),
  medicalRecords: many(medical_records),
  prescriptions: many(prescriptions),
  payment: one(payments),
}));

export const medicalRecordsRelations = relations(medical_records, ({ one }) => ({
  patient: one(users, {
    fields: [medical_records.patient_id],
    references: [users.id],
    relationName: 'patientRecords',
  }),
  doctor: one(users, {
    fields: [medical_records.doctor_id],
    references: [users.id],
    relationName: 'doctorRecords',
  }),
  appointment: one(appointments, {
    fields: [medical_records.appointment_id],
    references: [appointments.id],
  }),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  appointment: one(appointments, {
    fields: [prescriptions.appointment_id],
    references: [appointments.id],
  }),
  doctor: one(users, {
    fields: [prescriptions.doctor_id],
    references: [users.id],
    relationName: 'doctorPrescriptions',
  }),
  patient: one(users, {
    fields: [prescriptions.patient_id],
    references: [users.id],
    relationName: 'patientPrescriptions',
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  appointment: one(appointments, {
    fields: [payments.appointment_id],
    references: [appointments.id],
  }),
  patient: one(users, {
    fields: [payments.patient_id],
    references: [users.id],
  }),
}));
