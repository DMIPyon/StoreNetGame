import express from 'express';
import { 
  getUserOrders, 
  getOrderDetails, 
  createOrder, 
  cancelOrder 
} from '../controllers/orders.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

// Obtener todas las órdenes del usuario
router.get('/', authenticateToken, getUserOrders);

// Obtener detalles de una orden específica
router.get('/:id', authenticateToken, getOrderDetails);

// Crear una nueva orden
router.post('/', authenticateToken, createOrder);

// Cancelar una orden
router.put('/:id/cancel', authenticateToken, cancelOrder);

export default router; 