import { Request, Response } from 'express';
import { pool } from '../config/database';
import * as rawgApi from '../services/rawgApi';

export const getGames = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM games ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener juegos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getGameById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM games WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener juego:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const searchGames = async (req: Request, res: Response) => {
  const { q } = req.query;
  try {
    const result = await pool.query(
      'SELECT * FROM games WHERE title ILIKE $1 OR description ILIKE $1 OR category ILIKE $1',
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al buscar juegos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener juegos por categoría
export const getGamesByCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  try {
    // Si tenemos un category_id, usamos esa relación
    if (categoryId) {
      const result = await pool.query(
        'SELECT g.* FROM games g WHERE g.category_id = $1 ORDER BY g.title ASC',
        [categoryId]
      );
      return res.json(result.rows);
    }
    
    // Si no tenemos relaciones establecidas, podemos buscar por el nombre de categoría
    const categoryName = req.query.name;
    if (categoryName) {
      const result = await pool.query(
        'SELECT * FROM games WHERE category ILIKE $1 ORDER BY title ASC',
        [categoryName]
      );
      return res.json(result.rows);
    }
    
    // Si no hay parámetros, devolvemos todos los juegos
    const result = await pool.query('SELECT * FROM games ORDER BY title ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener juegos por categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear un nuevo juego
export const createGame = async (req: Request, res: Response) => {
  try {
    const { title, description, price, image_url, category, category_id } = req.body;
    
    // Validar que todos los campos necesarios estén presentes
    if (!title || !price) {
      return res.status(400).json({ error: 'El título y el precio son obligatorios' });
    }
    
    // Insertar el juego en la base de datos
    const result = await pool.query(
      'INSERT INTO games (title, description, price, image_url, category, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, price, image_url, category, category_id]
    );
    
    res.status(201).json({ 
      message: 'Juego creado correctamente',
      game: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear juego:', error);
    res.status(500).json({ error: 'Error al crear juego' });
  }
};

// Importar juegos desde RAWG
export const importFromRawg = async (req: Request, res: Response) => {
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
    const categoriesResult = await pool.query('SELECT id, name FROM categories');
    const categories = categoriesResult.rows;
    
    // Insertar juegos en la base de datos
    let insertedCount = 0;
    for (const game of games) {
      try {
        // Intentar hacer match de la categoría con las categorías predefinidas
        const matchedCategory = categories.find(cat => 
          cat.name.toLowerCase() === game.category.toLowerCase() ||
          game.category.toLowerCase().includes(cat.name.toLowerCase()) ||
          cat.name.toLowerCase().includes(game.category.toLowerCase())
        );
        
        await pool.query(
          'INSERT INTO games (title, description, price, image_url, category, category_id) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            game.title, 
            game.description, 
            game.price, 
            game.image_url, 
            game.category,
            matchedCategory ? matchedCategory.id : null
          ]
        );
        insertedCount++;
      } catch (error) {
        console.error(`Error al insertar juego ${game.title}:`, error);
        // Continúa con el siguiente juego si hay error
      }
    }
    
    res.json({ 
      message: `${insertedCount} juegos importados correctamente desde RAWG`,
      totalRequested: numCount,
      totalInserted: insertedCount 
    });
  } catch (error) {
    console.error('Error al importar juegos desde RAWG:', error);
    res.status(500).json({ error: 'Error al importar juegos desde RAWG' });
  }
};

// Buscar en RAWG y mostrar resultados sin insertar
export const searchRawg = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error al buscar juegos en RAWG:', error);
    res.status(500).json({ error: 'Error al buscar juegos en RAWG' });
  }
}; 