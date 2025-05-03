"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchGames = exports.getGameById = exports.getGames = void 0;
const database_1 = require("../config/database");
// Obtener todos los juegos
const getGames = async (req, res) => {
    try {
        const result = await database_1.pool.query('SELECT * FROM games');
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error al obtener juegos:', error);
        res.status(500).json({ error: 'Error al obtener juegos' });
    }
};
exports.getGames = getGames;
// Obtener un juego por ID
const getGameById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await database_1.pool.query('SELECT * FROM games WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Juego no encontrado' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error(`Error al obtener juego ${id}:`, error);
        res.status(500).json({ error: 'Error al obtener juego' });
    }
};
exports.getGameById = getGameById;
// Buscar juegos por título
const searchGames = async (req, res) => {
    const { query } = req.query;
    try {
        if (!query) {
            return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
        }
        const result = await database_1.pool.query('SELECT * FROM games WHERE title ILIKE $1', [`%${query}%`]);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error al buscar juegos:', error);
        res.status(500).json({ error: 'Error al buscar juegos' });
    }
};
exports.searchGames = searchGames;
