import express from 'express';
import * as gameController from '../controllers/gameController';

const router = express.Router();

// Rutas para juegos en nuestra base de datos
router.get('/', gameController.getGames);
router.get('/search', gameController.searchGames);
router.get('/:id', gameController.getGameById);

// Rutas para la integración con RAWG
router.get('/rawg/search', gameController.searchRawg);
router.post('/rawg/import', gameController.importFromRawg);

export default router; 