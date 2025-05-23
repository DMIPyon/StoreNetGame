import express from 'express';
import { authenticateJWT, isAdmin } from '../middlewares/auth.middleware';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats
} from '../controllers/admin.controller';

import {
  createGame,
  updateGame,
  deleteGame
} from '../controllers/game.controller';

import {
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller';

import {
  getOrders,
  getOrderById,
  updateOrderStatus
} from '../controllers/order.controller';

const router = express.Router();

// Proteger todas las rutas admin con autenticación y verificación de rol admin
router.use(authenticateJWT, isAdmin);

// Dashboard
router.get('/stats', getDashboardStats);

// Gestión de usuarios
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Gestión de juegos
router.post('/games', createGame);
router.put('/games/:id', updateGame);
router.delete('/games/:id', deleteGame);

// Gestión de categorías
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Gestión de pedidos
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id', updateOrderStatus);

export default router;