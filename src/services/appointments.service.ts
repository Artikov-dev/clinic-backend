import { eq, and, sql, gte, lte } from 'drizzle-orm';
import db from '../db';
import { appointments, users } from '../db/schema';
import { ApiError } from '../utils/apiResponse';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';
import { PaginationQuery } from '../types';

interface CreateAppointmentDto {
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
}

interface AppointmentQuery extends PaginationQuery {
  status?: string;
  date_from?: string;
  date_to?: string;
}

export class AppointmentsService {
  async create(dto: CreateAppointmentDto) {
    const [patient] = await db.select({ id: users.id }).from(users).where(eq(users.id, dto.patient_id));
    if (!patient) throw new ApiError(404, 'Patient not found');

    const [doctor] = await db.select({ id: users.id }).from(users).where(eq(users.id, dto.doctor_id));
    if (!doctor) throw new ApiError(404, 'Doctor not found');

    const [appointment] = await db
      .insert(appointments)
      .values({ ...dto, appointment_date: new Date(dto.appointment_date) })
      .returning();

    return appointment;
  }

  async getAll(query: AppointmentQuery) {
    const { page, limit, offset } = parsePagination(query);

    const conditions: any[] = [];
    if (query.status) conditions.push(eq(appointments.status, query.status as any));
    if (query.date_from) conditions.push(gte(appointments.appointment_date, new Date(query.date_from)));
    if (query.date_to) conditions.push(lte(appointments.appointment_date, new Date(query.date_to)));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(whereClause);

    const data = await db
      .select({
        id: appointments.id,
        appointment_date: appointments.appointment_date,
        status: appointments.status,
        created_at: appointments.created_at,
        patient_name: users.full_name,
      })
      .from(appointments)
      .leftJoin(users, eq(appointments.patient_id, users.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    return buildPaginatedResponse(data, Number(count), page, limit);
  }

  async getByPatient(patientId: string, query: AppointmentQuery) {
    const { page, limit, offset } = parsePagination(query);
    const conditions = [eq(appointments.patient_id, patientId)];
    if (query.status) conditions.push(eq(appointments.status, query.status as any));

    const whereClause = and(...conditions);
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(whereClause);

    const data = await db.select().from(appointments).where(whereClause).limit(limit).offset(offset);
    return buildPaginatedResponse(data, Number(count), page, limit);
  }

  async getByDoctor(doctorId: string, query: AppointmentQuery) {
    const { page, limit, offset } = parsePagination(query);
    const conditions = [eq(appointments.doctor_id, doctorId)];
    if (query.status) conditions.push(eq(appointments.status, query.status as any));

    const whereClause = and(...conditions);
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(whereClause);

    const data = await db.select().from(appointments).where(whereClause).limit(limit).offset(offset);
    return buildPaginatedResponse(data, Number(count), page, limit);
  }

  async getById(id: string) {
    const [appt] = await db.select().from(appointments).where(eq(appointments.id, id));
    if (!appt) throw new ApiError(404, 'Appointment not found');
    return appt;
  }

  async update(id: string, data: Partial<{ status: string; appointment_date: string }>) {
    const updateData: any = { updated_at: new Date() };
    if (data.status) updateData.status = data.status;
    if (data.appointment_date) updateData.appointment_date = new Date(data.appointment_date);

    const [updated] = await db
      .update(appointments)
      .set(updateData)
      .where(eq(appointments.id, id))
      .returning();

    if (!updated) throw new ApiError(404, 'Appointment not found');
    return updated;
  }

  async cancel(id: string) {
    return this.update(id, { status: 'cancelled' });
  }
}

export default new AppointmentsService();
