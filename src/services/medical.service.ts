import { eq, and, sql } from 'drizzle-orm';
import db from '../db';
import { medical_records, prescriptions, payments } from '../db/schema';
import { ApiError } from '../utils/apiResponse';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';
import { PaginationQuery } from '../types';

// ─── MEDICAL RECORDS ──────────────────────────────────────────────────────────
export class MedicalRecordsService {
  async create(doctorId: string, dto: { patient_id: string; appointment_id?: string; notes: string }) {
    const [record] = await db
      .insert(medical_records)
      .values({ ...dto, doctor_id: doctorId })
      .returning();
    return record;
  }

  async getByPatient(patientId: string, query: PaginationQuery) {
    const { page, limit, offset } = parsePagination(query);
    const where = eq(medical_records.patient_id, patientId);

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(medical_records).where(where);
    const data = await db.select().from(medical_records).where(where).limit(limit).offset(offset);
    return buildPaginatedResponse(data, Number(count), page, limit);
  }

  async getByDoctor(doctorId: string, query: PaginationQuery) {
    const { page, limit, offset } = parsePagination(query);
    const where = eq(medical_records.doctor_id, doctorId);

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(medical_records).where(where);
    const data = await db.select().from(medical_records).where(where).limit(limit).offset(offset);
    return buildPaginatedResponse(data, Number(count), page, limit);
  }

  async getById(id: string) {
    const [record] = await db.select().from(medical_records).where(eq(medical_records.id, id));
    if (!record) throw new ApiError(404, 'Medical record not found');
    return record;
  }

  async update(id: string, doctorId: string, notes: string) {
    const [updated] = await db
      .update(medical_records)
      .set({ notes, updated_at: new Date() })
      .where(and(eq(medical_records.id, id), eq(medical_records.doctor_id, doctorId)))
      .returning();
    if (!updated) throw new ApiError(404, 'Record not found or not authorized');
    return updated;
  }
}

// ─── PRESCRIPTIONS ────────────────────────────────────────────────────────────
export class PrescriptionsService {
  async create(doctorId: string, dto: {
    appointment_id: string;
    patient_id: string;
    medicine_name: string;
    dosage: string;
    instructions?: string;
  }) {
    const [prescription] = await db
      .insert(prescriptions)
      .values({ ...dto, doctor_id: doctorId })
      .returning();
    return prescription;
  }

  async getByPatient(patientId: string, query: PaginationQuery) {
    const { page, limit, offset } = parsePagination(query);
    const where = eq(prescriptions.patient_id, patientId);

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(prescriptions).where(where);
    const data = await db.select().from(prescriptions).where(where).limit(limit).offset(offset);
    return buildPaginatedResponse(data, Number(count), page, limit);
  }

  async getByDoctor(doctorId: string, query: PaginationQuery) {
    const { page, limit, offset } = parsePagination(query);
    const where = eq(prescriptions.doctor_id, doctorId);

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(prescriptions).where(where);
    const data = await db.select().from(prescriptions).where(where).limit(limit).offset(offset);
    return buildPaginatedResponse(data, Number(count), page, limit);
  }

  async getById(id: string) {
    const [p] = await db.select().from(prescriptions).where(eq(prescriptions.id, id));
    if (!p) throw new ApiError(404, 'Prescription not found');
    return p;
  }
}

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
export class PaymentsService {
  async create(dto: {
    appointment_id: string;
    patient_id: string;
    amount: string;
    payment_method?: string;
  }) {
    const [existing] = await db
      .select()
      .from(payments)
      .where(eq(payments.appointment_id, dto.appointment_id));

    if (existing) throw new ApiError(409, 'Payment already exists for this appointment');

    const [payment] = await db
      .insert(payments)
      .values({ ...dto, amount: dto.amount })
      .returning();
    return payment;
  }

  async getByPatient(patientId: string, query: PaginationQuery) {
    const { page, limit, offset } = parsePagination(query);
    const where = eq(payments.patient_id, patientId);

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(payments).where(where);
    const data = await db.select().from(payments).where(where).limit(limit).offset(offset);
    return buildPaginatedResponse(data, Number(count), page, limit);
  }

  async markAsPaid(id: string) {
    const [updated] = await db
      .update(payments)
      .set({ status: 'paid', updated_at: new Date() })
      .where(eq(payments.id, id))
      .returning();
    if (!updated) throw new ApiError(404, 'Payment not found');
    return updated;
  }

  async getAll(query: PaginationQuery) {
    const { page, limit, offset } = parsePagination(query);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(payments);
    const data = await db.select().from(payments).limit(limit).offset(offset);
    return buildPaginatedResponse(data, Number(count), page, limit);
  }
}

export const medicalRecordsService = new MedicalRecordsService();
export const prescriptionsService = new PrescriptionsService();
export const paymentsService = new PaymentsService();
