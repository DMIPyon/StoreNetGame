import express from 'express';
import { 
  getCart, 
  addItemToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart,
  checkAuthStatus
} from '../controllers/cart.controller';

const router = express.Router();

// Obtener carrito del usuario actual
router.get('/', getCart);

// Verificar el estado de autenticación del usuario
router.get('/check-auth', checkAuthStatus);

// Añadir item al carrito
router.post('/items', addItemToCart);

// Actualizar cantidad de un item
router.put('/items/:itemId', updateCartItem);

// Eliminar un item del carrito
router.delete('/items/:itemId', removeFromCart);

// Vaciar todo el carrito
router.delete('/', clearCart);

export default router; 