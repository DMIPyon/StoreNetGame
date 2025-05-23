import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'netgames',
  password: 'doma1128',
  port: 5433,
});

const dropTables = async () => {
  try {
    await pool.query(`
      DROP TABLE IF EXISTS favorites CASCADE;
      DROP TABLE IF EXISTS reviews CASCADE;
      DROP TABLE IF EXISTS order_items CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS cart_items CASCADE;
      DROP TABLE IF EXISTS carts CASCADE;
      DROP TABLE IF EXISTS games CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS developers CASCADE;
      DROP TABLE IF EXISTS roles CASCADE;
      DROP TABLE IF EXISTS game_developers CASCADE;
      DROP TABLE IF EXISTS coupons CASCADE;
      DROP TABLE IF EXISTS order_coupons CASCADE;
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS reports CASCADE;
      DROP TABLE IF EXISTS activity_logs CASCADE;
      DROP TABLE IF EXISTS refresh_tokens CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS wishlists CASCADE;
      DROP TABLE IF EXISTS addresses CASCADE;
    `);
    console.log('✅ Todas las tablas han sido eliminadas correctamente.');
  } catch (error) {
    console.error('❌ Error al eliminar las tablas:', error);
  } finally {
    await pool.end();
  }
};

dropTables(); 