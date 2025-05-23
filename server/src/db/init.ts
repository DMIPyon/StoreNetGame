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
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMPTZ,
        email_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255)
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // Crear tabla de categorías
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        icon VARCHAR(50),
        slug VARCHAR(50) UNIQUE,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
    `);

    // Crear tabla de desarrolladores
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS developers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        website VARCHAR(255)
      );
    `);

    // Crear tabla de juegos mejorada
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        cover_url TEXT,
        banner_url TEXT,
        original_price DECIMAL(10,2),
        discount INTEGER,
        rating DECIMAL(3,1),
        developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL,
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
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        stock INTEGER DEFAULT NULL,
        sold_count INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT false,
        slug VARCHAR(150) UNIQUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_games_title ON games(title);
      CREATE INDEX IF NOT EXISTS idx_games_slug ON games(slug);
      CREATE INDEX IF NOT EXISTS idx_games_category_id ON games(category_id);
    `);

    // Crear tabla de carritos
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tabla de items de carrito
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
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
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMPTZ
      );
    `);

    // Crear tabla de detalles de orden
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        game_id INTEGER REFERENCES games(id) ON DELETE SET NULL,
        price_at_purchase DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
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
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, game_id)
      );
    `);

    // Crear tabla de favoritos
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, game_id)
      );
    `);

    // Crear tabla de wallet (cartera)
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS wallet (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        balance NUMERIC(12,2) DEFAULT 0
      );
    `);

    // Crear tabla de movimientos de wallet
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS wallet_movements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL, -- 'deposit', 'purchase', 'refund', etc.
        amount NUMERIC(12,2) NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tabla de roles
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      );
      INSERT INTO roles (name) VALUES ('user'), ('admin'), ('seller') ON CONFLICT DO NOTHING;
    `);

    // Modificar tabla de usuarios para agregar referencia a roles
    await netgamesPool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES roles(id) DEFAULT 1;
    `);

    // Tabla intermedia juego-desarrollador
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS game_developers (
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
        PRIMARY KEY (game_id, developer_id)
      );
    `);

    // Tabla de cupones
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        discount_percent INTEGER CHECK (discount_percent BETWEEN 1 AND 100),
        max_uses INTEGER,
        expires_at TIMESTAMPTZ
      );
    `);

    // Tabla intermedia orden-cupon
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS order_coupons (
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        coupon_id INTEGER REFERENCES coupons(id) ON DELETE CASCADE,
        PRIMARY KEY (order_id, coupon_id)
      );
    `);

    // Tabla de pagos
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        payment_method VARCHAR(50),
        payment_status VARCHAR(20),
        transaction_id VARCHAR(100),
        paid_at TIMESTAMPTZ
      );
    `);

    // Tabla de reportes
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        game_id INTEGER REFERENCES games(id) ON DELETE SET NULL,
        review_id INTEGER REFERENCES reviews(id) ON DELETE SET NULL,
        reason TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de logs de actividad
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        details TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de refresh tokens
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de notificaciones
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de wishlist (lista de deseos)
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, game_id)
      );
    `);

    // Crear tabla intermedia para juegos y categorías (muchos a muchos)
    await netgamesPool.query(`
      CREATE TABLE IF NOT EXISTS game_categories (
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (game_id, category_id)
      );
    `);

    // Inicializar categorías predefinidas
    await initializeCategories();

    // Insertar usuario anónimo para carritos de usuarios no autenticados
    try {
      const userExists = await netgamesPool.query(
        'SELECT id FROM users WHERE id = 999'
      );
      
      if (userExists.rows.length === 0) {
        await netgamesPool.query(`
          INSERT INTO users (id, username, email, password_hash, first_name, last_name, role)
          VALUES (999, 'anonymous', 'anonymous@netgames.com', 'no-password', 'Usuario Anónimo', 'Anónimo', 'guest')
          ON CONFLICT (id) DO NOTHING;
        `);
      }
    } catch (error) {
      console.error('❌ Error al crear usuario anónimo:', error);
    }

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