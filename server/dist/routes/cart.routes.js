"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cart_controller_1 = require("../controllers/cart.controller");
const router = express_1.default.Router();
// Obtener carrito del usuario actual
router.get('/', cart_controller_1.getCart);
// Verificar el estado de autenticación del usuario
router.get('/check-auth', cart_controller_1.checkAuthStatus);
// Añadir item al carrito
router.post('/items', cart_controller_1.addItemToCart);
// Actualizar cantidad de un item
router.put('/items/:itemId', cart_controller_1.updateCartItem);
// Eliminar un item del carrito
router.delete('/items/:itemId', cart_controller_1.removeFromCart);
// Vaciar todo el carrito
router.delete('/', cart_controller_1.clearCart);
exports.default = router;
