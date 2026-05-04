import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const getRoles = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🔍 Fetching available roles...\n');
    const result = await pool.query('SELECT id, name FROM roles LIMIT 10');

    if (result.rows.length === 0) {
      console.log('❌ No roles found. Creating default roles...\n');
      
      // Create default roles if none exist
      const defaultRoles = ['admin', 'doctor', 'patient', 'staff'];
      for (const role of defaultRoles) {
        await pool.query('INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [role]);
      }
      
      const newRoles = await pool.query('SELECT id, name FROM roles');
      console.log('✅ Created default roles:\n');
      newRoles.rows.forEach(row => {
        console.log(`  • ${row.name}: ${row.id}`);
      });
    } else {
      console.log('✅ Available roles:\n');
      result.rows.forEach(row => {
        console.log(`  • ${row.name}: ${row.id}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
};

getRoles();
