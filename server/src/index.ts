import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gameRoutes from './routes/games';
import categoryRoutes from './routes/categories.routes';
import authRoutes from './routes/auth.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/orders.routes';
import { initDatabase } from './db/init';

// Configurar variables de entorno
dotenv.config();

// Inicializar app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logging simple
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rutas
app.use('/api/games', gameRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: '¡Bienvenido a la API de StoreNetGames!',
    version: '1.0.0',
    endpoints: [
      '/api/games',
      '/api/categories',
      '/api/auth',
      '/api/cart',
      '/api/orders'
    ]
  });
});

// Manejador de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error no controlado:', err);
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