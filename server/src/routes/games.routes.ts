import { Router } from 'express';
import { 
  getGames, 
  getGameById, 
  searchGames,
  createGame,
  getGamesByCategory,
  getDiscountedGames,
  getPopularGames
} from '../controllers/games.controller';
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller';

const router = Router();

// Rutas para juegos
router.get('/', getGames);
router.get('/discounted', getDiscountedGames);
router.get('/popular', getPopularGames);
router.get('/search', searchGames);
router.get('/category/:categoryId', getGamesByCategory);
router.get('/:id', getGameById);
router.post('/', createGame);

// Rutas para categorías
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

export default router; 