import { Pool } from 'pg';

export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'netgames', // Cambiamos a la base de datos netgames
  password: 'doma1128', // Cambia esto por tu contraseña real
  port: 5433, 
}); 