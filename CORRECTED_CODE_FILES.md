# Complete Fixed Code Files

This document contains all corrected and created files for the `deleted_at` column issue fix.

---

## File 1: src/db/migrate.ts

**Status**: ✅ UPDATED  
**Purpose**: Run database migrations with SSL support for Render PostgreSQL

```typescript
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const runMigrations = async () => {
  const sslConfig = process.env.DATABASE_URL?.includes('render.com')
    ? { rejectUnauthorized: false }
    : undefined;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ...(sslConfig && { ssl: sslConfig }),
  });

  const db = drizzle(pool);

  console.log('⏳ Running migrations...');
  await migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') });
  console.log('✅ Migrations completed!');

  await pool.end();
};

runMigrations().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
```

**Key Changes**:
- Added SSL configuration for Render PostgreSQL
- Detects `render.com` in DATABASE_URL
- Graceful error handling

---

## File 2: src/db/migrations/0001_add_deleted_at_column.sql

**Status**: ✅ CREATED  
**Purpose**: SQL migration to add `deleted_at` column to users table

```sql
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP;
```

**Why**:
- Implements soft delete pattern
- Allows account deactivation without data loss
- Maintains referential integrity

---

## File 3: src/db/migrations/meta/_journal.json

**Status**: ✅ CREATED  
**Purpose**: Drizzle ORM migration history tracker

```json
{
  "version": "5",
  "dialect": "postgresql",
  "entries": [
    {
      "idx": 0,
      "version": "5",
      "when": 1714754400000,
      "tag": "0001_add_deleted_at_column",
      "name": "0001_add_deleted_at_column"
    }
  ]
}
```

**Why**:
- Drizzle ORM requires this file to track migration state
- Prevents re-running already applied migrations
- Enables future migration chaining

---

## File 4: src/services/auth.service.ts

**Status**: ✅ NO CHANGES NEEDED (Already correct)  
**Note**: This file was already correctly implemented

```typescript
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import db from '../db';
import { users, roles } from '../db/schema';
import { signToken } from '../utils/jwt';
import { ApiError } from '../utils/apiResponse';

interface RegisterDto {
  full_name: string;
  email: string;
  password: string;
  role_id: string;
}

interface LoginDto {
  email: string;
  password: string;
}

export class AuthService {
  async register(dto: RegisterDto) {
    const [existing] = await db.select().from(users).where(eq(users.email, dto.email));
    if (existing) throw new ApiError(409, 'Email already registered');

    const [role] = await db.select().from(roles).where(eq(roles.id, dto.role_id));
    if (!role) throw new ApiError(404, 'Role not found');

    const hashed = await bcrypt.hash(dto.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...dto, password: hashed })
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
        deleted_at: users.deleted_at,  // ← NOW AVAILABLE: previously caused error
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
    return db.select().from(roles);
  }
}

export default new AuthService();
```

**Why No Changes Needed**:
- Code was already written to handle soft deletes
- Just needed the database column to exist
- Now works perfectly with the new column

---

## File 5: src/db/schema/index.ts

**Status**: ✅ NO CHANGES NEEDED (Already correct)  
**Relevant Section** - users table definition:

```typescript
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
    deleted_at: timestamp('deleted_at'),  // ← Already defined, now created in DB
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index('idx_users_email').on(table.email),
    roleIdx: index('idx_users_role').on(table.role_id),
  })
);
```

---

## Execution Steps (What Was Done)

```bash
# Step 1: Create migrations directory
mkdir src/db/migrations/meta

# Step 2: Create migration SQL file
echo 'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP;' > src/db/migrations/0001_add_deleted_at_column.sql

# Step 3: Create migration journal
# (JSON file created to track migration state)

# Step 4: Update migrate.ts with SSL support
# (Updated file with render.com detection)

# Step 5: Run migration
npm run db:migrate
# Output: ✅ Migrations completed!

# Step 6: Verify column exists
npx tsx verify-schema.ts
# Output: ✅ deleted_at column exists!

# Step 7: Test endpoints
npm run start:ts
npx tsx test-register.ts
npx tsx test-login.ts
# Output: ✅ All tests passed!
```

---

## PostgreSQL Compatibility

### Before Fix
```sql
-- This query would FAIL
SELECT email, deleted_at FROM users WHERE email = 'test@clinic.com';
-- Error: column "deleted_at" does not exist
```

### After Fix
```sql
-- This query now WORKS
SELECT email, deleted_at FROM users WHERE email = 'test@clinic.com';
-- Result: Returns email and deleted_at (NULL for active users)
```

### Soft Delete Query Pattern
```sql
-- Get only active users
SELECT * FROM users WHERE deleted_at IS NULL;

-- Deactivate a user (soft delete)
UPDATE users SET deleted_at = NOW() WHERE id = 'user-uuid';

-- Reactivate a user
UPDATE users SET deleted_at = NULL WHERE id = 'user-uuid';
```

---

## Testing Evidence

### Test 1: Register Endpoint ✅
```
POST /api/auth/register
Status: 201 Created

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "d43ee798-1ab5-4fd2-88e7-b8e58f6fb6f9",
      "full_name": "Alii Valiyev",
      "email": "alii@clinic.com",
      "role_id": "f5b27fc4-cc34-487b-956f-3b007e438714",
      "created_at": "2026-05-02T17:39:36.959Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Test 2: Login Endpoint ✅
```
POST /api/auth/login
Status: 200 OK

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "d43ee798-1ab5-4fd2-88e7-b8e58f6fb6f9",
      "full_name": "Alii Valiyev",
      "email": "alii@clinic.com",
      "role_id": "f5b27fc4-cc34-487b-956f-3b007e438714",
      "role_name": "patient",
      "deleted_at": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Test 3: Schema Verification ✅
```
Users table columns:
✓ id: uuid (NOT NULL)
✓ full_name: character varying (NOT NULL)
✓ email: character varying (NOT NULL)
✓ password: character varying (NOT NULL)
✓ role_id: uuid (NOT NULL)
✓ created_at: timestamp (NULL)
✓ deleted_at: timestamp (NULL) ← CONFIRMED
```

---

## Summary

| Issue | Cause | Solution | Status |
|-------|-------|----------|--------|
| `column "deleted_at" does not exist` | ORM schema defined column but DB table didn't have it | Created migration and applied it | ✅ Fixed |
| Missing migration system | No migrations folder existed | Created migrations folder & journal | ✅ Fixed |
| SSL connection issues | migrate.ts lacked SSL support | Added Render.com SSL detection | ✅ Fixed |
| Register endpoint 500 error | Database query failed | Endpoint now works (201 Created) | ✅ Fixed |
| Login endpoint couldn't check soft delete | Column missing from DB | Endpoint works (200 OK, soft delete ready) | ✅ Fixed |

---

## Production Deployment Notes

1. **Before deploying** to production, run migrations:
   ```bash
   npm run db:migrate
   ```

2. **Soft delete is now active**:
   - Deactivate user: `UPDATE users SET deleted_at = NOW() WHERE id = 'uuid'`
   - Login rejects if `deleted_at` is not null

3. **Future migrations**:
   - Generate: `npm run db:generate`
   - Apply: `npm run db:migrate`
   - New migrations auto-tracked in `_journal.json`

4. **Database backups**: Always backup before running migrations

---

**All files are production-ready and PostgreSQL compatible.** ✅
