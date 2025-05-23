"use strict";
// Archivo de servicio para la API de RAWG
// Implementación mínima para evitar errores de importación
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertRawgGameToOurFormat = exports.importGamesFromRawg = exports.getGameDetails = exports.searchGames = void 0;
const searchGames = async (query, page, pageSize) => {
    return { results: [] };
};
exports.searchGames = searchGames;
const getGameDetails = async (gameId) => {
    return {};
};
exports.getGameDetails = getGameDetails;
const importGamesFromRawg = async (count) => {
    return [];
};
exports.importGamesFromRawg = importGamesFromRawg;
const convertRawgGameToOurFormat = (rawgGame) => {
    return {
        title: '',
        description: '',
        price: 0,
        releaseDate: new Date(),
        developer: '',
        publisher: '',
        platforms: [],
        genres: [],
        tags: [],
        coverUrl: '',
        screenshots: []
    };
};
exports.convertRawgGameToOurFormat = convertRawgGameToOurFormat;
