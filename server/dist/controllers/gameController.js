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
exports.searchRawg = exports.importFromRawg = exports.searchGames = exports.getGameById = exports.getGames = void 0;
const database_1 = require("../config/database");
const rawgApi = __importStar(require("../services/rawgApi"));
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
        // Insertar juegos en la base de datos
        let insertedCount = 0;
        for (const game of games) {
            try {
                await database_1.pool.query('INSERT INTO games (title, description, price, image_url, category) VALUES ($1, $2, $3, $4, $5)', [game.title, game.description, game.price, game.image_url, game.category]);
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
        const { query, page = 1, pageSize = 20 } = req.query;
        if (!query) {
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
        const rawgGames = await rawgApi.searchGames(query.toString(), numPage, numPageSize);
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
