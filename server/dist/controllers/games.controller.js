"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGame = exports.getGamesByCategory = exports.searchGames = exports.getGameById = exports.getPopularGames = exports.getDiscountedGames = exports.getGames = void 0;
const database_1 = require("../config/database");
const getGames = async (req, res) => {
    try {
        const result = await database_1.pool.query(`
      SELECT g.*, d.name as developer, ARRAY_REMOVE(ARRAY_AGG(gc.category_id), NULL) as category_ids
      FROM games g
      LEFT JOIN developers d ON g.developer_id = d.id
      LEFT JOIN game_categories gc ON g.id = gc.game_id
      GROUP BY g.id, d.name
      ORDER BY g.id ASC
    `);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error al obtener juegos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.getGames = getGames;
// Obtener juegos en oferta (con descuento mayor a 0)
const getDiscountedGames = async (req, res) => {
    try {
        const result = await database_1.pool.query(`SELECT g.*, d.name as developer, ARRAY_REMOVE(ARRAY_AGG(gc.category_id), NULL) as category_ids FROM games g
       LEFT JOIN developers d ON g.developer_id = d.id
       LEFT JOIN game_categories gc ON g.id = gc.game_id
       WHERE g.discount IS NOT NULL AND g.discount > 0
       GROUP BY g.id, d.name
       ORDER BY g.discount DESC`);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error al obtener juegos en oferta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.getDiscountedGames = getDiscountedGames;
// Obtener juegos populares (ordenados por rating)
const getPopularGames = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 8;
        const result = await database_1.pool.query(`SELECT g.*, d.name as developer, ARRAY_REMOVE(ARRAY_AGG(gc.category_id), NULL) as category_ids FROM games g
       LEFT JOIN developers d ON g.developer_id = d.id
       LEFT JOIN game_categories gc ON g.id = gc.game_id
       WHERE g.rating IS NOT NULL
       GROUP BY g.id, d.name
       ORDER BY g.rating DESC
       LIMIT $1`, [limit]);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error al obtener juegos populares:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.getPopularGames = getPopularGames;
const getGameById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await database_1.pool.query(`
      SELECT g.*, d.name as developer,
        ARRAY_AGG(c.name) as categories,
        ARRAY_AGG(c.icon) as category_icons
      FROM games g
      LEFT JOIN developers d ON g.developer_id = d.id
      LEFT JOIN game_categories gc ON g.id = gc.game_id
      LEFT JOIN categories c ON gc.category_id = c.id
      WHERE g.id = $1
      GROUP BY g.id, d.name
    `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Juego no encontrado' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error al obtener juego:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.getGameById = getGameById;
const searchGames = async (req, res) => {
    const { q } = req.query;
    try {
        const result = await database_1.pool.query('SELECT * FROM games WHERE title ILIKE $1 OR description ILIKE $1', [`%${q}%`]);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error al buscar juegos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.searchGames = searchGames;
// Obtener juegos por categoría
const getGamesByCategory = async (req, res) => {
    const { categoryId } = req.params;
    try {
        // Si tenemos un categoryId, usamos la relación muchos a muchos
        if (categoryId) {
            const result = await database_1.pool.query(`SELECT g.*, d.name as developer, c.name as category, c.icon as category_icon
         FROM games g
         JOIN game_categories gc ON g.id = gc.game_id
         JOIN categories c ON gc.category_id = c.id
         LEFT JOIN developers d ON g.developer_id = d.id
         WHERE gc.category_id = $1
         ORDER BY g.title ASC`, [categoryId]);
            return res.json(result.rows);
        }
        // Si no hay parámetros, devolvemos todos los juegos
        const result = await database_1.pool.query('SELECT * FROM games ORDER BY title ASC');
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error al obtener juegos por categoría:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.getGamesByCategory = getGamesByCategory;
// Crear un nuevo juego
const createGame = async (req, res) => {
    try {
        const { title, description, price, category, category_id, cover_url, banner_url } = req.body;
        // Validar que todos los campos necesarios estén presentes
        if (!title || !price) {
            return res.status(400).json({ error: 'El título y el precio son obligatorios' });
        }
        // Insertar el juego en la base de datos
        const result = await database_1.pool.query('INSERT INTO games (title, description, price, category, category_id, cover_url, banner_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [title, description, price, category, category_id, cover_url, banner_url]);
        res.status(201).json({
            message: 'Juego creado correctamente',
            game: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error al crear juego:', error);
        res.status(500).json({ error: 'Error al crear juego' });
    }
};
exports.createGame = createGame;
