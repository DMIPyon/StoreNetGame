"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("../controllers/admin.controller");
const admin_games_controller_1 = require("../controllers/admin.games.controller");
const admin_categories_controller_1 = require("../controllers/admin.categories.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Todas las rutas de administración requieren autenticación y rol de administrador
router.use(auth_middleware_1.authenticateJWT, auth_middleware_1.isAdmin);
// Rutas de gestión de usuarios
router.get('/users', admin_controller_1.getAllUsers);
router.get('/users/:id', admin_controller_1.getUserById);
router.put('/users/:id', admin_controller_1.updateUser);
router.delete('/users/:id', admin_controller_1.deleteUser);
// Rutas de gestión de juegos
router.post('/games', admin_games_controller_1.createGame);
router.put('/games/:id', admin_games_controller_1.updateGame);
router.delete('/games/:id', admin_games_controller_1.deleteGame);
// Rutas de gestión de categorías
router.post('/categories', admin_categories_controller_1.createCategory);
router.put('/categories/:id', admin_categories_controller_1.updateCategory);
router.delete('/categories/:id', admin_categories_controller_1.deleteCategory);
// Estadísticas para el dashboard
router.get('/dashboard/stats', admin_controller_1.getDashboardStats);
exports.default = router;
