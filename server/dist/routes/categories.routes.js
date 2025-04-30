"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const router = (0, express_1.Router)();
// Rutas para categorías
router.get('/categories', category_controller_1.getCategories);
router.get('/categories/:id', category_controller_1.getCategoryById);
router.post('/categories', category_controller_1.createCategory);
router.put('/categories/:id', category_controller_1.updateCategory);
router.delete('/categories/:id', category_controller_1.deleteCategory);
exports.default = router;
