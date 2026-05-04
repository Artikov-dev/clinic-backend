import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const EXTERNAL_DATABASE_URL = 'postgresql://clinic:uPQbMqWuVY03Be66v6BODeE1Q5J2fNTn@dpg-d7q8ut77f7vs73cpi4ng-a.virginia-postgres.render.com/forclinic';

interface TestResult {
  timestamp: string;
  connectionStatus: string;
  databaseInfo: any;
  tables: any[];
  errors: string[];
}

async function testDatabase(): Promise<TestResult> {
  const result: TestResult = {
    timestamp: new Date().toISOString(),
    connectionStatus: 'pending',
    databaseInfo: {},
    tables: [],
    errors: [],
  };

  const pool = new Pool({
    connectionString: EXTERNAL_DATABASE_URL,
    connectionTimeoutMillis: 5000,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    // Test 1: Basic Connection
    console.log('🔍 Testing database connection...');
    const client = await pool.connect();
    result.connectionStatus = 'connected';
    console.log('✅ Connection successful');

    // Test 2: Get database info
    console.log('📊 Fetching database information...');
    const versionResult = await client.query('SELECT version()');
    result.databaseInfo.version = versionResult.rows[0].version;

    const dbResult = await client.query('SELECT current_database(), current_user');
    result.databaseInfo.database = dbResult.rows[0].current_database;
    result.databaseInfo.user = dbResult.rows[0].current_user;

    // Test 3: Get all tables
    console.log('📋 Fetching tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    result.tables = tablesResult.rows.map(row => row.table_name);
    console.log(`✅ Found ${result.tables.length} tables`);

    // Test 4: Get table details
    console.log('🔎 Fetching table details...');
    for (const table of result.tables) {
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
      `, [table]);
      result.tables[result.tables.indexOf(table)] = {
        name: table,
        columns: columnsResult.rows,
      };
    }

    // Test 5: Basic query test
    console.log('🧪 Running test query...');
    if (result.tables.length > 0) {
      const firstTable = result.tables[0]?.name || '';
      if (firstTable) {
        const countResult = await client.query(`SELECT COUNT(*) FROM ${firstTable}`);
        console.log(`✅ Query test successful - ${firstTable} has ${countResult.rows[0].count} rows`);
      }
    }

    client.release();
    
  } catch (error: any) {
    result.connectionStatus = 'failed';
    result.errors.push(error.message || String(error));
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }

  return result;
}

async function main() {
  console.log('═'.repeat(60));
  console.log('🚀 External Database Connection Test');
  console.log('═'.repeat(60));
  console.log(`\n📍 Testing URL: ${EXTERNAL_DATABASE_URL.replace(/:[^:/@]*@/, ':****@')}\n`);

  const result = await testDatabase();

  // Generate markdown report
  const report = `# Database Connection Test Report

**Generated**: ${result.timestamp}

## Connection Status
- **Status**: ${result.connectionStatus === 'connected' ? '✅ CONNECTED' : '❌ FAILED'}
- **Database URL**: \`postgresql://clinic:***@dpg-d7q8ut77f7vs73cpi4ng-a.virginia-postgres.render.com/forclinic\`

## Database Information
${result.databaseInfo.database ? `- **Database Name**: \`${result.databaseInfo.database}\`` : ''}
${result.databaseInfo.user ? `- **User**: \`${result.databaseInfo.user}\`` : ''}
${result.databaseInfo.version ? `- **PostgreSQL Version**: ${result.databaseInfo.version}` : ''}

## Tables (${result.tables.length} found)

${result.tables.length > 0 ? result.tables.map((table: any) => {
  if (typeof table === 'object' && table.name) {
    return `### ${table.name}
| Column | Type | Nullable |
|--------|------|----------|
${table.columns.map((col: any) => `| ${col.column_name} | ${col.data_type} | ${col.is_nullable === 'YES' ? 'Yes' : 'No'} |`).join('\n')}
`;
  }
  return `- ${table}`;
}).join('\n') : 'No tables found'}

## Test Results

${result.connectionStatus === 'connected' ? `
✅ **All tests passed successfully!**
- Database is accessible and responding
- ${result.tables.length} table(s) detected
- Query execution working properly
` : `
❌ **Connection failed!**
${result.errors.map(err => `- ${err}`).join('\n')}
`}

## Errors
${result.errors.length > 0 ? result.errors.map(err => `- \`${err}\``).join('\n') : 'No errors'}

---
*Test completed at ${new Date().toLocaleString()}*
`;

  // Write to file
  const reportPath = path.join(process.cwd(), 'database_test.md');
  fs.writeFileSync(reportPath, report);
  console.log('\n' + '═'.repeat(60));
  console.log(`✅ Report saved to: ${reportPath}`);
  console.log('═'.repeat(60));
}

main().catch(console.error);
