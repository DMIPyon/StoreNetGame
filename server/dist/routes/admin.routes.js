"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const admin_controller_1 = require("../controllers/admin.controller");
const game_controller_1 = require("../controllers/game.controller");
const category_controller_1 = require("../controllers/category.controller");
const order_controller_1 = require("../controllers/order.controller");
const router = express_1.default.Router();
// Proteger todas las rutas admin con autenticación y verificación de rol admin
router.use(auth_middleware_1.authenticateJWT, auth_middleware_1.isAdmin);
// Dashboard
router.get('/stats', admin_controller_1.getDashboardStats);
// Gestión de usuarios
router.get('/users', admin_controller_1.getAllUsers);
router.get('/users/:id', admin_controller_1.getUserById);
router.put('/users/:id', admin_controller_1.updateUser);
router.delete('/users/:id', admin_controller_1.deleteUser);
// Gestión de juegos
router.post('/games', game_controller_1.createGame);
router.put('/games/:id', game_controller_1.updateGame);
router.delete('/games/:id', game_controller_1.deleteGame);
// Gestión de categorías
router.post('/categories', category_controller_1.createCategory);
router.put('/categories/:id', category_controller_1.updateCategory);
router.delete('/categories/:id', category_controller_1.deleteCategory);
// Gestión de pedidos
router.get('/orders', order_controller_1.getOrders);
router.get('/orders/:id', order_controller_1.getOrderById);
router.patch('/orders/:id', order_controller_1.updateOrderStatus);
exports.default = router;
