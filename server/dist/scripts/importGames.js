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
const database_1 = require("../config/database");
const rawgApi = __importStar(require("../services/rawgApi"));
// Géneros de juegos populares para importar
const POPULAR_GENRES = [
    'action',
    'adventure',
    'rpg',
    'strategy',
    'shooter',
    'puzzle',
    'racing',
    'sports',
    'fighting',
    'platformer',
    'simulation',
    'indie'
];
// Plataformas populares
const POPULAR_PLATFORMS = [1, 4, 5, 18, 186, 187]; // PC, PS4, PS5, Xbox One, Xbox Series S/X, Nintendo Switch
async function importGamesByGenres() {
    try {
        console.log('Iniciando importación de juegos desde RAWG...');
        // Obtener categorías de la base de datos
        const categoriesResult = await database_1.pool.query('SELECT id, name FROM categories');
        const categories = categoriesResult.rows;
        console.log(`Categorías disponibles en la base de datos: ${categories.map(c => c.name).join(', ')}`);
        let totalImported = 0;
        // Para cada género, importar juegos
        for (const genre of POPULAR_GENRES) {
            console.log(`\nImportando juegos del género: ${genre}`);
            try {
                // Obtenemos juegos por género y plataformas populares
                const response = await rawgApi.getGamesByGenre(genre, 1, 15);
                // Convertir a nuestro formato
                const games = response.map(rawgApi.convertRawgGameToOurFormat);
                // Insertar juegos
                let genreImported = 0;
                for (const game of games) {
                    try {
                        // Buscar si el juego ya existe
                        const existingGame = await database_1.pool.query('SELECT id FROM games WHERE title = $1', [game.title]);
                        if (existingGame.rows.length > 0) {
                            console.log(`  - Juego "${game.title}" ya existe en la base de datos.`);
                            continue;
                        }
                        // Hacer matching con categorías para mostrar información pero no lo usamos en la inserción
                        const matchedCategory = categories.find(cat => cat.name.toLowerCase() === game.category.toLowerCase() ||
                            game.category.toLowerCase().includes(cat.name.toLowerCase()) ||
                            cat.name.toLowerCase().includes(game.category.toLowerCase()));
                        if (matchedCategory) {
                            console.log(`  * Categoría detectada: ${matchedCategory.name} para el juego ${game.title}`);
                        }
                        // Insertar juego (sin usar category_id)
                        await database_1.pool.query('INSERT INTO games (title, description, price, image_url, category) VALUES ($1, $2, $3, $4, $5)', [
                            game.title,
                            game.description,
                            game.price,
                            game.image_url,
                            game.category
                        ]);
                        genreImported++;
                        console.log(`  + Juego importado: ${game.title} (${game.category})`);
                    }
                    catch (error) {
                        console.error(`  ! Error al importar juego "${game.title}":`, error);
                    }
                }
                console.log(`  ✅ ${genreImported} juegos importados para el género "${genre}"`);
                totalImported += genreImported;
            }
            catch (error) {
                console.error(`  ❌ Error al importar juegos del género "${genre}":`, error);
            }
        }
        console.log(`\n✅ Importación completada. Total de juegos importados: ${totalImported}`);
    }
    catch (error) {
        console.error('❌ Error durante la importación de juegos:', error);
    }
    finally {
        database_1.pool.end();
    }
}
// Ejecutar la importación
importGamesByGenres().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});
