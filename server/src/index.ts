import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gameRoutes from './routes/games.routes';
import categoryRoutes from './routes/categories.routes';
import authRoutes from './routes/auth.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/orders.routes';
import adminRoutes from './routes/admin.routes';
import { initDatabase } from './db/init';
import { initializeCategories } from './controllers/category.controller';
import expressPino from 'express-pino-logger';
import logger from './utils/logger';
import path from 'path';
import expressLayouts from 'express-ejs-layouts';
import { pool } from './config/database';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middlewares/error.middleware';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import paymentRoutes from './routes/payment.routes';
import walletRoutes from './routes/wallet.routes';

// Configurar variables de entorno
dotenv.config();

// Validar variables de entorno críticas
const requiredEnv = ['JWT_SECRET', 'RAWG_API_KEY', 'DATABASE_URL'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error('Faltan variables de entorno críticas:', missingEnv.join(', '));
  process.exit(1);
}

// Inicializar app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de vistas EJS y layouts
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');

// Servir archivos estáticos (CSS, imágenes, JS cliente)
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressPino({ logger }));

app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones por IP
  standardHeaders: true,
  legacyHeaders: false,
}));

// Rutas
app.use('/api/games', gameRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/wallet', walletRoutes);

// Documentación de la API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Home renderizado con plantillas EJS
app.get('/', async (req, res, next) => {
  try {
    // Obtener categorías y juegos populares de la base de datos
    const categoriesResult = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    const popularResult = await pool.query('SELECT * FROM games ORDER BY rating DESC LIMIT 12');
    res.render('index', {
      title: 'Inicio',
      categories: categoriesResult.rows,
      popularGames: popularResult.rows
    });
  } catch (err) {
    next(err);
  }
});

// Manejador de errores global
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  
  // Inicializar la base de datos si es necesario
  try {
    if (process.env.INIT_DB === 'true') {
      console.log('Inicializando base de datos...');
      await initDatabase();
      console.log('Base de datos inicializada correctamente');
    }
    
    // Inicializar categorías predefinidas
    await initializeCategories();
  } catch (error) {
    console.error('Error durante la inicialización:', error);
  }

  console.log('JWT_SECRET:', process.env.JWT_SECRET);
  console.log('RAWG_API_KEY:', process.env.RAWG_API_KEY);
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
}); 