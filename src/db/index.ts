import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { config } from '../config/env';

const sslConfig = config.DATABASE_URL.includes('render.com') || config.NODE_ENV === 'production'
  ? { rejectUnauthorized: false }
  : undefined;

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ...(sslConfig && { ssl: sslConfig }),
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
  process.exit(-1);
});

export const db = drizzle(pool, { schema });

export const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    client.release();
    console.log('✅ PostgreSQL connected successfully');
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    process.exit(1);
  }
};

export default db;
