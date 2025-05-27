import express from 'express';
import { 
  getUserOrders, 
  getOrderDetails, 
  createOrder, 
  cancelOrder, 
  getOrderHistory 
} from '../controllers/orders.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { checkout } from '../controllers/order.controller';

const router = express.Router();

// Obtener todas las órdenes del usuario
router.get('/', authenticateJWT, getUserOrders);

// Obtener detalles de una orden específica
router.get('/:id', authenticateJWT, getOrderDetails);

// Crear una nueva orden
router.post('/', authenticateJWT, createOrder);

// Cancelar una orden
router.put('/:id/cancel', authenticateJWT, cancelOrder);

// Historial de compras del usuario
router.get('/history', authenticateJWT, getOrderHistory);

router.post('/checkout', checkout);

export default router; 