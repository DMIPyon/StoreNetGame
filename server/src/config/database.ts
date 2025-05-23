import dotenv from 'dotenv';
import { Pool } from 'pg';

// Cargar variables de entorno
dotenv.config();

const dbConfig = {
  connectionString: process.env.DATABASE_URL
};

export const pool = new Pool(dbConfig); 