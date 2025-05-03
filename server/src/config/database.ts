import dotenv from 'dotenv';
import { Pool } from 'pg';

// Cargar variables de entorno
dotenv.config();

// Configuración de prueba explícita
const dbConfig = {
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'doma1128',
  database: 'netgames'
};

export const pool = new Pool(dbConfig); 