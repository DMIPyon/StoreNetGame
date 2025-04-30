"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeCategories = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getCategories = void 0;
const database_1 = require("../config/database");
// Categorías predefinidas
const defaultCategories = [
    { name: 'Acción', icon: 'flame-outline' },
    { name: 'Aventura', icon: 'map-outline' },
    { name: 'RPG', icon: 'game-controller-outline' },
    { name: 'Estrategia', icon: 'bulb-outline' },
    { name: 'Deportes', icon: 'football-outline' },
    { name: 'Simulación', icon: 'airplane-outline' },
    { name: 'Casual', icon: 'happy-outline' },
    { name: 'Indie', icon: 'flash-outline' },
    { name: 'Carreras', icon: 'car-sport-outline' },
    { name: 'Shooter', icon: 'aperture-outline' },
    { name: 'Puzzle', icon: 'extension-puzzle-outline' },
    { name: 'Terror', icon: 'skull-outline' },
    { name: 'Plataformas', icon: 'layers-outline' },
    { name: 'Lucha', icon: 'fist-outline' },
    { name: 'Sandbox', icon: 'cube-outline' }
];
// Obtener todas las categorías
const getCategories = async (req, res) => {
    try {
        const result = await database_1.pool.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.getCategories = getCategories;
// Obtener una categoría por ID
const getCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await database_1.pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error al obtener categoría:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.getCategoryById = getCategoryById;
// Crear una nueva categoría
const createCategory = async (req, res) => {
    try {
        const { name, icon } = req.body;
        // Validar que el nombre esté presente
        if (!name) {
            return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
        }
        // Insertar la categoría en la base de datos
        const result = await database_1.pool.query('INSERT INTO categories (name, icon) VALUES ($1, $2) RETURNING *', [name, icon]);
        res.status(201).json({
            message: 'Categoría creada correctamente',
            category: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({ error: 'Error al crear categoría' });
    }
};
exports.createCategory = createCategory;
// Actualizar una categoría
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, icon } = req.body;
    try {
        // Validar que el nombre esté presente
        if (!name) {
            return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
        }
        const result = await database_1.pool.query('UPDATE categories SET name = $1, icon = $2 WHERE id = $3 RETURNING *', [name, icon, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        res.json({
            message: 'Categoría actualizada correctamente',
            category: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error al actualizar categoría:', error);
        res.status(500).json({ error: 'Error al actualizar categoría' });
    }
};
exports.updateCategory = updateCategory;
// Eliminar una categoría
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        // Verificar si la categoría existe
        const checkResult = await database_1.pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        // Verificar si hay juegos asociados a esta categoría
        const gamesResult = await database_1.pool.query('SELECT COUNT(*) FROM games WHERE category_id = $1', [id]);
        if (parseInt(gamesResult.rows[0].count) > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar la categoría porque hay juegos asociados a ella'
            });
        }
        // Eliminar la categoría
        await database_1.pool.query('DELETE FROM categories WHERE id = $1', [id]);
        res.json({ message: 'Categoría eliminada correctamente' });
    }
    catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({ error: 'Error al eliminar categoría' });
    }
};
exports.deleteCategory = deleteCategory;
// Inicializar categorías predefinidas
const initializeCategories = async () => {
    try {
        // Verificar si ya existen categorías
        const result = await database_1.pool.query('SELECT COUNT(*) FROM categories');
        if (parseInt(result.rows[0].count) === 0) {
            console.log('Inicializando categorías...');
            // Insertar categorías predefinidas
            for (const category of defaultCategories) {
                await database_1.pool.query('INSERT INTO categories (name, icon) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING', [category.name, category.icon]);
            }
            console.log('✅ Categorías inicializadas correctamente');
        }
        else {
            console.log('✅ Las categorías ya existen en la base de datos');
        }
    }
    catch (error) {
        console.error('❌ Error al inicializar categorías:', error);
    }
};
exports.initializeCategories = initializeCategories;
