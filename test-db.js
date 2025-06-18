import { pool } from './server/db.ts';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT 1 as test');
    console.log('Database connection successful:', result.rows);
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testConnection();