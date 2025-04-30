import { Pool } from 'pg';
import { initDatabase } from '../db/init';
import { pool } from '../config/database';

async function updateDatabase() {
  console.log('Iniciando actualización de la base de datos...');
  
  // Primero nos conectamos a postgres para reiniciar la base de datos
  const mainPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'doma1128',
    port: 5433
  });

  try {
    // Cerrar todas las conexiones activas a la base de datos netgames
    const client = await mainPool.connect();
    try {
      await client.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = 'netgames'
        AND pid <> pg_backend_pid();
      `);
      
      // Eliminar la base de datos si existe
      await client.query(`DROP DATABASE IF EXISTS netgames;`);
      console.log('Base de datos eliminada correctamente');
    } finally {
      client.release();
    }

    // Reiniciar la base de datos con la nueva estructura
    await initDatabase();
    console.log('Base de datos recreada con la nueva estructura');

    // Ejecutar el seed para insertar datos
    const { seedDatabase } = require('../db/seed');
    await seedDatabase();
    console.log('Datos insertados correctamente');

    console.log('✅ Actualización de la base de datos completada exitosamente');
  } catch (error) {
    console.error('❌ Error al actualizar la base de datos:', error);
  } finally {
    await mainPool.end();
  }
}

// Ejecutar la actualización
updateDatabase(); 