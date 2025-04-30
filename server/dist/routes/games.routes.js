"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const games_controller_1 = require("../controllers/games.controller");
const category_controller_1 = require("../controllers/category.controller");
const router = (0, express_1.Router)();
// Rutas para juegos
router.get('/games', games_controller_1.getGames);
router.get('/games/search', games_controller_1.searchGames);
router.get('/games/category/:categoryId', games_controller_1.getGamesByCategory);
router.get('/games/:id', games_controller_1.getGameById);
router.post('/games', games_controller_1.createGame);
// Rutas para categorías
router.get('/categories', category_controller_1.getCategories);
router.get('/categories/:id', category_controller_1.getCategoryById);
router.post('/categories', category_controller_1.createCategory);
router.put('/categories/:id', category_controller_1.updateCategory);
router.delete('/categories/:id', category_controller_1.deleteCategory);
// Rutas para la integración con RAWG
router.get('/rawg/search', games_controller_1.searchRawg);
router.post('/rawg/import', games_controller_1.importFromRawg);
exports.default = router;
