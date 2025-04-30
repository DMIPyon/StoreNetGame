import { Router } from 'express';
import { 
  getGames, 
  getGameById, 
  searchGames, 
  importFromRawg, 
  searchRawg, 
  createGame,
  getGamesByCategory 
} from '../controllers/games.controller';
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller';

const router = Router();

// Rutas para juegos
router.get('/games', getGames);
router.get('/games/search', searchGames);
router.get('/games/category/:categoryId', getGamesByCategory);
router.get('/games/:id', getGameById);
router.post('/games', createGame);

// Rutas para categorías
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Rutas para la integración con RAWG
router.get('/rawg/search', searchRawg);
router.post('/rawg/import', importFromRawg);

export default router; 