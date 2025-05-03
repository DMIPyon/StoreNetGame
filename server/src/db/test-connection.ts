import { pool } from '../config/database';

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Conexión exitosa a la base de datos:', result.rows[0]);
    
    try {
      const tableResult = await pool.query('SELECT * FROM games LIMIT 1');
      console.log('Tabla games existe, registros:', tableResult.rowCount);
    } catch (err: any) {
      console.log('La tabla games no existe o hay un error en la consulta:', err.message);
    }
  } catch (err: any) {
    console.error('Error conectando a la base de datos:', err);
  }
}

testConnection(); 