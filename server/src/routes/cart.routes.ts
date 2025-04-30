import express from 'express';
import { 
  getCart, 
  addItemToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} from '../controllers/cart.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

// Todas las rutas de carrito requieren autenticación
router.use(authenticateToken);

// Obtener carrito del usuario actual
router.get('/', getCart);

// Añadir item al carrito
router.post('/items', addItemToCart);

// Actualizar cantidad de un item
router.put('/items/:itemId', updateCartItem);

// Eliminar un item del carrito
router.delete('/items/:itemId', removeFromCart);

// Vaciar todo el carrito
router.delete('/', clearCart);

export default router; 