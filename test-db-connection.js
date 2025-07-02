import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(client => {
    return client.query('SELECT NOW()')
      .then(res => {
        console.log('Conexión exitosa:', res.rows[0]);
        client.release();
        process.exit(0);
      })
      .catch(err => {
        client.release();
        console.error('Error en la consulta:', err.stack);
        process.exit(1);
      });
  })
  .catch(err => {
    console.error('No se pudo conectar a la base de datos:', err.stack);
    process.exit(1);
  }); 