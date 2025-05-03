import { pool } from '../config/database';

async function createAnonymousUser() {
  try {
    // Verificar si el usuario anónimo ya existe
    const userExists = await pool.query(
      'SELECT id FROM users WHERE id = 999'
    );
    
    if (userExists.rows.length === 0) {
      // Insertar usuario anónimo si no existe
      await pool.query(`
        INSERT INTO users (id, username, email, password_hash, first_name, last_name, role)
        VALUES (999, 'anonymous', 'anonymous@netgames.com', 'no-password', 'Usuario', 'Anónimo', 'guest')
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log('✅ Usuario anónimo creado correctamente');
    } else {
      console.log('✅ Usuario anónimo ya existe');
    }
  } catch (error) {
    console.error('❌ Error al crear usuario anónimo:', error);
  } finally {
    // Cerrar la conexión del pool
    await pool.end();
  }
}

// Ejecutar la función
createAnonymousUser(); 