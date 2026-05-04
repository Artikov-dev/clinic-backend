import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
    ssl: process.env.DATABASE_URL?.includes('render.com') ? true : false,
  },
  verbose: true,
  strict: true,
} satisfies Config;
