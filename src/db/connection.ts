import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

export const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    console.log('✅ PostgreSQL 연결 성공:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL 연결 실패:', error);
    return false;
  }
};

export default pool;
