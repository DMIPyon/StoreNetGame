"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Rutas públicas
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
// Rutas de perfil con autenticación
router.get('/profile', auth_middleware_1.authenticateJWT, auth_controller_1.getProfile);
router.put('/profile', auth_middleware_1.authenticateJWT, auth_controller_1.updateProfile);
router.post('/change-password', auth_middleware_1.authenticateJWT, auth_controller_1.changePassword);
exports.default = router;
