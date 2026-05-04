import { eq, ilike, and, isNull, sql } from 'drizzle-orm';
import db from '../db';
import { users, roles } from '../db/schema';
import { getRoleByName } from '../db/roles';
import { ApiError } from '../utils/apiResponse';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';
import { PaginationQuery } from '../types';

export class UsersService {
  private safeUserFields = {
    id: users.id,
    full_name: users.full_name,
    email: users.email,
    role_id: users.role_id,
    created_at: users.created_at,
    deleted_at: users.deleted_at,
  };

  async getAllDoctors(query: PaginationQuery) {
    const { page, limit, offset, search } = parsePagination(query);

    const doctorRole = await getRoleByName('doctor');
    if (!doctorRole) throw new ApiError(500, 'Doctor role not configured');

    const conditions = [eq(users.role_id, doctorRole.id), isNull(users.deleted_at)];
    if (search) conditions.push(ilike(users.full_name, `%${search}%`));

    const whereClause = and(...conditions);
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause);

    const data = await db
      .select(this.safeUserFields)
      .from(users)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    return buildPaginatedResponse(data, Number(count), page, limit);
  }

  async getAllPatients(query: PaginationQuery) {
    const { page, limit, offset, search } = parsePagination(query);

    const patientRole = await getRoleByName('patient');
    if (!patientRole) throw new ApiError(500, 'Patient role not configured');

    const conditions = [eq(users.role_id, patientRole.id), isNull(users.deleted_at)];
    if (search) conditions.push(ilike(users.full_name, `%${search}%`));

    const whereClause = and(...conditions);
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause);

    const data = await db
      .select(this.safeUserFields)
      .from(users)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    return buildPaginatedResponse(data, Number(count), page, limit);
  }

  async getUserById(id: string) {
    const [user] = await db
      .select({
        ...this.safeUserFields,
        role_name: roles.name,
      })
      .from(users)
      .leftJoin(roles, eq(users.role_id, roles.id))
      .where(and(eq(users.id, id), isNull(users.deleted_at)));

    if (!user) throw new ApiError(404, 'User not found');
    return user;
  }

  async deactivateUser(id: string) {
    const [user] = await db
      .update(users)
      .set({ deleted_at: new Date() })
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!user) throw new ApiError(404, 'User not found');
    return user;
  }

  async updateUser(id: string, data: { full_name?: string; email?: string }) {
    const [updated] = await db
      .update(users)
      .set(data)
      .where(and(eq(users.id, id), isNull(users.deleted_at)))
      .returning(this.safeUserFields);

    if (!updated) throw new ApiError(404, 'User not found');
    return updated;
  }
}

export default new UsersService();
