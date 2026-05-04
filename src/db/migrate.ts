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
