import { pool } from '../config/database';
import { Pool } from 'pg';
import { initializeCategories } from '../controllers/category.controller';

const initDatabase = async () => {
  try {
    // Primero nos conectamos a la base de datos postgres
    const client = await pool.connect();
    
    try {
      // Verificar si la base de datos existe
      const result = await client.query(
        "SELECT 1 FROM pg_database WHERE datname = 'netgames'"
      );
      
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
      } else {
        console.log('✅ La base de datos ya existe');
      }
    } finally {
      client.release();
    }

    // Ahora nos conectamos a la base de datos netgames
    const netgamesPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'netgames',
      password: 'doma1128',
      port: 5433,
    });

    // Crear tabla de usuarios mejorada
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        profile_image VARCHAR(255) DEFAULT 'default-avatar.png',
        role VARCHAR(20) DEFAULT 'user',
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tabla de categorías
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        icon VARCHAR(50),
        slug VARCHAR(50) UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tabla de juegos mejorada
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
        stock INTEGER DEFAULT 999,
        sold_count INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT false,
        slug VARCHAR(150) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tabla de carritos
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tabla de items de carrito
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(cart_id, game_id)
      );
    `);

    // Crear tabla de órdenes
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        payment_method VARCHAR(50),
        shipping_address TEXT,
        order_number VARCHAR(20) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tabla de detalles de orden
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        game_id INTEGER REFERENCES games(id),
        price_at_purchase DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tabla de reviews
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, game_id)
      );
    `);

    // Crear tabla de favoritos
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, game_id)
      );
    `);

    // Inicializar categorías predefinidas
    await initializeCategories();

    console.log('✅ Tablas creadas exitosamente');
    await netgamesPool.end();
    
    return netgamesPool;
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  }
};

export { initDatabase };

// Si este archivo se ejecuta directamente, inicializar la base de datos
if (require.main === module) {
  initDatabase()
    .then(() => console.log('Base de datos inicializada correctamente'))
    .catch(err => console.error('Error inicializando la base de datos:', err));
} 