import express from 'express';
import { 
  getUserOrders, 
  getOrderDetails, 
  createOrder, 
  cancelOrder 
} from '../controllers/orders.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

// Todas las rutas de órdenes requieren autenticación
router.use(authenticateToken);

// Obtener todas las órdenes del usuario
router.get('/', getUserOrders);

// Obtener detalles de una orden específica
router.get('/:id', getOrderDetails);

// Crear una nueva orden
router.post('/', createOrder);

// Cancelar una orden
router.put('/:id/cancel', cancelOrder);

export default router; 