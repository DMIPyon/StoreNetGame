"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = void 0;
const database_1 = require("../config/database");
const pg_1 = require("pg");
const category_controller_1 = require("../controllers/category.controller");
const initDatabase = async () => {
    try {
        // Primero nos conectamos a la base de datos postgres
        const client = await database_1.pool.connect();
        try {
            // Verificar si la base de datos existe
            const result = await client.query("SELECT 1 FROM pg_database WHERE datname = 'netgames'");
            if (result.rows.length === 0) {
                // Crear la base de datos si no existe
                await client.query(`
          CREATE DATABASE netgames
          WITH 
          OWNER = postgres
          ENCODING = 'UTF8'
          TEMPLATE template0
          LC_COLLATE = 'es-ES'
          LC_CTYPE = 'es-ES'
          TABLESPACE = pg_default
          CONNECTION LIMIT = -1;
        `);
                console.log('✅ Base de datos creada correctamente');
            }
            else {
                console.log('✅ La base de datos ya existe');
            }
        }
        finally {
            client.release();
        }
        // Ahora nos conectamos a la base de datos netgames
        const netgamesPool = new pg_1.Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'netgames',
            password: 'doma1128',
            port: 5433,
        });
        // Crear tabla de usuarios
        await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        // Crear tabla de categorías
        await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        icon VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        // Crear tabla de juegos
        await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_url TEXT,
        original_price DECIMAL(10,2),
        discount INTEGER,
        rating DECIMAL(3,1),
        developer VARCHAR(100),
        release_date VARCHAR(50),
        tags TEXT[],
        requirements_min_os VARCHAR(100),
        requirements_min_processor VARCHAR(100),
        requirements_min_memory VARCHAR(100),
        requirements_min_graphics VARCHAR(100),
        requirements_min_storage VARCHAR(100),
        requirements_rec_os VARCHAR(100),
        requirements_rec_processor VARCHAR(100),
        requirements_rec_memory VARCHAR(100),
        requirements_rec_graphics VARCHAR(100),
        requirements_rec_storage VARCHAR(100),
        category VARCHAR(50),
        category_id INTEGER REFERENCES categories(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        // Crear tabla de compras
        await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        game_id INTEGER REFERENCES games(id),
        purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        price_at_purchase DECIMAL(10,2) NOT NULL
      );
    `);
        // Inicializar categorías predefinidas
        await (0, category_controller_1.initializeCategories)();
        console.log('✅ Tablas creadas exitosamente');
        await netgamesPool.end();
        return netgamesPool;
    }
    catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error);
        throw error;
    }
};
exports.initDatabase = initDatabase;
// Si este archivo se ejecuta directamente, inicializar la base de datos
if (require.main === module) {
    initDatabase()
        .then(() => console.log('Base de datos inicializada correctamente'))
        .catch(err => console.error('Error inicializando la base de datos:', err));
}
