"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = void 0;
const database_1 = require("../db/database");
/**
 * Crear una nueva categoría
 */
const createCategory = async (req, res) => {
    try {
        const { name, description, icon } = req.body;
        // Validar campo requerido
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la categoría es obligatorio'
            });
        }
        // Insertar la categoría
        const result = await database_1.pool.query(`INSERT INTO categories (name, description, icon) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, description, icon`, [name, description || null, icon || null]);
        res.status(201).json({
            success: true,
            message: 'Categoría creada exitosamente',
            data: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear categoría',
            error: error.message
        });
    }
};
exports.createCategory = createCategory;
/**
 * Actualizar una categoría existente
 */
const updateCategory = async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);
        const { name, description, icon } = req.body;
        if (isNaN(categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría inválido'
            });
        }
        // Verificar si la categoría existe
        const checkCategory = await database_1.pool.query('SELECT id FROM categories WHERE id = $1', [categoryId]);
        if (checkCategory.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        // Actualizar solo los campos proporcionados
        let updateQuery = 'UPDATE categories SET ';
        const updateValues = [];
        const updateFields = [];
        if (name !== undefined) {
            updateFields.push(`name = $${updateValues.length + 1}`);
            updateValues.push(name);
        }
        if (description !== undefined) {
            updateFields.push(`description = $${updateValues.length + 1}`);
            updateValues.push(description);
        }
        if (icon !== undefined) {
            updateFields.push(`icon = $${updateValues.length + 1}`);
            updateValues.push(icon);
        }
        // Si no hay campos para actualizar
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos para actualizar'
            });
        }
        // Completar la consulta
        updateQuery += updateFields.join(', ');
        updateQuery += ` WHERE id = $${updateValues.length + 1} RETURNING id, name, description, icon`;
        updateValues.push(categoryId);
        // Ejecutar la actualización
        const result = await database_1.pool.query(updateQuery, updateValues);
        res.status(200).json({
            success: true,
            message: 'Categoría actualizada exitosamente',
            data: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error al actualizar categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar categoría',
            error: error.message
        });
    }
};
exports.updateCategory = updateCategory;
/**
 * Eliminar una categoría
 */
const deleteCategory = async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);
        if (isNaN(categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría inválido'
            });
        }
        // Verificar si la categoría existe
        const checkCategory = await database_1.pool.query('SELECT id FROM categories WHERE id = $1', [categoryId]);
        if (checkCategory.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        // Eliminar las relaciones en game_categories
        await database_1.pool.query('DELETE FROM game_categories WHERE category_id = $1', [categoryId]);
        // Eliminar la categoría
        await database_1.pool.query('DELETE FROM categories WHERE id = $1', [categoryId]);
        res.status(200).json({
            success: true,
            message: 'Categoría eliminada exitosamente'
        });
    }
    catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar categoría',
            error: error.message
        });
    }
};
exports.deleteCategory = deleteCategory;
