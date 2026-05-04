import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import db from '../db';
import { users, roles } from '../db/schema';
import { getAllRoles, getRoleById, getRoleByName } from '../db/roles';
import { signToken } from '../utils/jwt';
import { ApiError } from '../utils/apiResponse';
import { RoleName } from '../types';

interface RegisterDto {
  full_name: string;
  email: string;
  password: string;
  role_id?: string;
  role_name?: RoleName;
}

interface LoginDto {
  email: string;
  password: string;
}

export class AuthService {
  async register(dto: RegisterDto) {
    const [existing] = await db.select().from(users).where(eq(users.email, dto.email));
    if (existing) throw new ApiError(409, 'Email already registered');

    const role = dto.role_id
      ? await getRoleById(dto.role_id)
      : dto.role_name
        ? await getRoleByName(dto.role_name)
        : null;

    if (!role) throw new ApiError(404, 'Role not found');

    const hashed = await bcrypt.hash(dto.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        full_name: dto.full_name,
        email: dto.email,
        password: hashed,
        role_id: role.id,
      })
      .returning({
        id: users.id,
        full_name: users.full_name,
        email: users.email,
        role_id: users.role_id,
        created_at: users.created_at,
      });

    const token = signToken({ userId: user.id, email: user.email, role: role.name as any });
    return { user, token };
  }

  async login(dto: LoginDto) {
    const [user] = await db
      .select({
        id: users.id,
        full_name: users.full_name,
        email: users.email,
        password: users.password,
        role_id: users.role_id,
        role_name: roles.name,
        deleted_at: users.deleted_at,
      })
      .from(users)
      .leftJoin(roles, eq(users.role_id, roles.id))
      .where(eq(users.email, dto.email));

    if (!user) throw new ApiError(401, 'Invalid credentials');
    if (user.deleted_at) throw new ApiError(403, 'Account is deactivated');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new ApiError(401, 'Invalid credentials');

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role_name as any,
    });

    const { password: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  async getRoles() {
    return getAllRoles();
  }
}

export default new AuthService();
