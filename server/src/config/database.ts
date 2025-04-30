import dotenv from 'dotenv';
import { Pool } from 'pg';

// Cargar variables de entorno
dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
}); 