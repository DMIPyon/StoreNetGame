import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env['DATABASE_URL']
});

async function createAdmin() {
  const username = 'admin';
  const email = 'admin@admin.com';
  const password = 'admin123';
  const firstName = 'Admin';
  const lastName = 'Principal';
  const role = 'admin';

  // Hashear la contraseña
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    // Verificar si ya existe un admin
    const exists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      console.log('⚠️  El usuario admin ya existe.');
      return;
    }
    await pool.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, true, true)`,
      [username, email, passwordHash, firstName, lastName, role]
    );
    console.log('Usuario admin creado correctamente.');
  } catch (error) {
    console.error('❌ Error al crear el usuario admin:', error);
  } finally {
    await pool.end();
  }
}

createAdmin(); 