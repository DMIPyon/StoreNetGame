"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const bcrypt_1 = __importDefault(require("bcrypt"));
const pool = new pg_1.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'netgames',
    password: 'doma1128',
    port: 5433,
});
async function createAdmin() {
    const username = 'admin';
    const email = 'admin@admin.com';
    const password = 'admin123';
    const firstName = 'Admin';
    const lastName = 'Principal';
    const role = 'admin';
    // Hashear la contraseña
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    try {
        // Verificar si ya existe un admin
        const exists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (exists.rows.length > 0) {
            console.log('⚠️  El usuario admin ya existe.');
            return;
        }
        await pool.query(`INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, true, true)`, [username, email, passwordHash, firstName, lastName, role]);
        console.log('✅ Usuario admin creado correctamente.');
    }
    catch (error) {
        console.error('❌ Error al crear el usuario admin:', error);
    }
    finally {
        await pool.end();
    }
}
createAdmin();
