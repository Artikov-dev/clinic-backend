import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const testColumn = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🔍 Checking users table schema...');
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Users table columns:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    const hasDeletedAt = result.rows.some(r => r.column_name === 'deleted_at');
    if (hasDeletedAt) {
      console.log('\n✅ deleted_at column exists!');
    } else {
      console.log('\n❌ deleted_at column NOT found!');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
};

testColumn();
