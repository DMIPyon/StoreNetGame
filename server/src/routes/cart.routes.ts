import express from 'express';
import { 
  getCart, 
  addItemToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart,
  checkAuthStatus
} from '../controllers/cart.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = express.Router();

// Obtener carrito del usuario actual (autenticado o anónimo)
router.get('/', authenticateJWT, getCart);

// Verificar el estado de autenticación del usuario
router.get('/check-auth', authenticateJWT, checkAuthStatus);

// Añadir item al carrito
router.post('/items', authenticateJWT, addItemToCart);

// Actualizar cantidad de un item
router.put('/items/:itemId', authenticateJWT, updateCartItem);

// Eliminar un item del carrito
router.delete('/items/:itemId', authenticateJWT, removeFromCart);

// Vaciar todo el carrito
router.delete('/', authenticateJWT, clearCart);

export default router; 