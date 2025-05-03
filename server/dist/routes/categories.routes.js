"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const router = (0, express_1.Router)();
// Rutas para categorías
router.get('/', category_controller_1.getCategories);
router.get('/:id', category_controller_1.getCategoryById);
router.post('/', category_controller_1.createCategory);
router.put('/:id', category_controller_1.updateCategory);
router.delete('/:id', category_controller_1.deleteCategory);
exports.default = router;
