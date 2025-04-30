import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gameRoutes from './routes/games.routes';
import categoryRoutes from './routes/categories.routes';
import authRoutes from './routes/auth.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/orders.routes';
import { initDatabase } from './db/init';
import expressPino from 'express-pino-logger';
import logger from './utils/logger';
import path from 'path';
import expressLayouts from 'express-ejs-layouts';
import { pool } from './config/database';
import helmet from 'helmet';
import xssClean from 'xss-clean';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Configurar variables de entorno
dotenv.config();

// Inicializar app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Seguridad HTTP
app.use(helmet());
app.use(xssClean());
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', apiLimiter);

// Configuración de vistas EJS y layouts
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');

// Servir archivos estáticos (CSS, imágenes, JS cliente)
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressPino({ logger }));

// Rutas
app.use('/api/games', gameRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err }, 'Error no controlado');
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

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
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  }
}); 