"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRawg = exports.importFromRawg = exports.createGame = exports.getGamesByCategory = exports.searchGames = exports.getGameById = exports.getGames = void 0;
const database_1 = require("../config/database");
const rawgApi = __importStar(require("../services/rawgApi"));
const getGames = async (req, res) => {
    try {
        const result = await database_1.pool.query('SELECT * FROM games ORDER BY id ASC');
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error al obtener juegos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.getGames = getGames;
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
        console.error('Error al obtener juego:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.getGameById = getGameById;
const searchGames = async (req, res) => {
    const { q } = req.query;
    try {
        const result = await database_1.pool.query('SELECT * FROM games WHERE title ILIKE $1 OR description ILIKE $1 OR category ILIKE $1', [`%${q}%`]);
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
        // Si tenemos un category_id, usamos esa relación
        if (categoryId) {
            const result = await database_1.pool.query('SELECT g.* FROM games g WHERE g.category_id = $1 ORDER BY g.title ASC', [categoryId]);
            return res.json(result.rows);
        }
        // Si no tenemos relaciones establecidas, podemos buscar por el nombre de categoría
        const categoryName = req.query.name;
        if (categoryName) {
            const result = await database_1.pool.query('SELECT * FROM games WHERE category ILIKE $1 ORDER BY title ASC', [categoryName]);
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
        const { title, description, price, image_url, category, category_id } = req.body;
        // Validar que todos los campos necesarios estén presentes
        if (!title || !price) {
            return res.status(400).json({ error: 'El título y el precio son obligatorios' });
        }
        // Insertar el juego en la base de datos
        const result = await database_1.pool.query('INSERT INTO games (title, description, price, image_url, category, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [title, description, price, image_url, category, category_id]);
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
// Importar juegos desde RAWG
const importFromRawg = async (req, res) => {
    try {
        const { count = 20 } = req.query;
        const numCount = Number(count);
        // Validar que count sea un número válido
        if (isNaN(numCount) || numCount <= 0 || numCount > 100) {
            return res.status(400).json({
                error: 'El parámetro count debe ser un número entre 1 y 100'
            });
        }
        // Obtener juegos de RAWG
        const games = await rawgApi.importGamesFromRawg(numCount);
        // Obtener categorías de la base de datos para hacer matching
        const categoriesResult = await database_1.pool.query('SELECT id, name FROM categories');
        const categories = categoriesResult.rows;
        // Insertar juegos en la base de datos
        let insertedCount = 0;
        for (const game of games) {
            try {
                // Intentar hacer match de la categoría con las categorías predefinidas
                const matchedCategory = categories.find(cat => cat.name.toLowerCase() === game.category.toLowerCase() ||
                    game.category.toLowerCase().includes(cat.name.toLowerCase()) ||
                    cat.name.toLowerCase().includes(game.category.toLowerCase()));
                await database_1.pool.query('INSERT INTO games (title, description, price, image_url, category, category_id) VALUES ($1, $2, $3, $4, $5, $6)', [
                    game.title,
                    game.description,
                    game.price,
                    game.image_url,
                    game.category,
                    matchedCategory ? matchedCategory.id : null
                ]);
                insertedCount++;
            }
            catch (error) {
                console.error(`Error al insertar juego ${game.title}:`, error);
                // Continúa con el siguiente juego si hay error
            }
        }
        res.json({
            message: `${insertedCount} juegos importados correctamente desde RAWG`,
            totalRequested: numCount,
            totalInserted: insertedCount
        });
    }
    catch (error) {
        console.error('Error al importar juegos desde RAWG:', error);
        res.status(500).json({ error: 'Error al importar juegos desde RAWG' });
    }
};
exports.importFromRawg = importFromRawg;
// Buscar en RAWG y mostrar resultados sin insertar
const searchRawg = async (req, res) => {
    try {
        const { q, page = 1, pageSize = 20 } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
        }
        const numPage = Number(page);
        const numPageSize = Number(pageSize);
        // Validar parámetros
        if (isNaN(numPage) || numPage <= 0) {
            return res.status(400).json({ error: 'El parámetro page debe ser un número positivo' });
        }
        if (isNaN(numPageSize) || numPageSize <= 0 || numPageSize > 40) {
            return res.status(400).json({
                error: 'El parámetro pageSize debe ser un número entre 1 y 40'
            });
        }
        // Buscar en RAWG
        const rawgGames = await rawgApi.searchGames(q.toString(), numPage, numPageSize);
        // Convertir a nuestro formato
        const games = rawgGames.map(rawgApi.convertRawgGameToOurFormat);
        res.json({
            count: games.length,
            results: games
        });
    }
    catch (error) {
        console.error('Error al buscar juegos en RAWG:', error);
        res.status(500).json({ error: 'Error al buscar juegos en RAWG' });
    }
};
exports.searchRawg = searchRawg;
