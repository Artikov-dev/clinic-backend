import { eq } from 'drizzle-orm';
import db from '.';
import { roles } from './schema';

const DEFAULT_ROLE_NAMES = ['admin', 'doctor', 'patient', 'reception'] as const;

export const ensureDefaultRoles = async () => {
  await db
    .insert(roles)
    .values(DEFAULT_ROLE_NAMES.map((name) => ({ name })))
    .onConflictDoNothing({ target: roles.name });
};

export const getRoleById = async (roleId: string) => {
  await ensureDefaultRoles();

  const [role] = await db.select().from(roles).where(eq(roles.id, roleId));
  return role;
};

export const getRoleByName = async (name: (typeof DEFAULT_ROLE_NAMES)[number]) => {
  await ensureDefaultRoles();

  const [role] = await db.select().from(roles).where(eq(roles.name, name));
  return role;
};

export const getAllRoles = async () => {
  await ensureDefaultRoles();
  return db.select().from(roles);
};
