"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orders_controller_1 = require("../controllers/orders.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Obtener todas las órdenes del usuario
router.get('/', auth_middleware_1.authenticateToken, orders_controller_1.getUserOrders);
// Obtener detalles de una orden específica
router.get('/:id', auth_middleware_1.authenticateToken, orders_controller_1.getOrderDetails);
// Crear una nueva orden
router.post('/', auth_middleware_1.authenticateToken, orders_controller_1.createOrder);
// Cancelar una orden
router.put('/:id/cancel', auth_middleware_1.authenticateToken, orders_controller_1.cancelOrder);
exports.default = router;
