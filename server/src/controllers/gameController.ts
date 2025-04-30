import { Request, Response } from 'express';
import { pool } from '../config/database';
import * as rawgApi from '../services/rawgApi';

// Obtener todos los juegos
export const getGames = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM games');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener juegos:', error);
    res.status(500).json({ error: 'Error al obtener juegos' });
  }
};

// Obtener un juego por ID
export const getGameById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM games WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error al obtener juego ${id}:`, error);
    res.status(500).json({ error: 'Error al obtener juego' });
  }
};

// Buscar juegos por título
export const searchGames = async (req: Request, res: Response) => {
  const { query } = req.query;
  try {
    if (!query) {
      return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
    }
    
    const result = await pool.query(
      'SELECT * FROM games WHERE title ILIKE $1',
      [`%${query}%`]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error al buscar juegos:', error);
    res.status(500).json({ error: 'Error al buscar juegos' });
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
    
    // Insertar juegos en la base de datos
    let insertedCount = 0;
    for (const game of games) {
      try {
        await pool.query(
          'INSERT INTO games (title, description, price, image_url, category) VALUES ($1, $2, $3, $4, $5)',
          [game.title, game.description, game.price, game.image_url, game.category]
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
  } catch (error) {
    console.error('Error al buscar juegos en RAWG:', error);
    res.status(500).json({ error: 'Error al buscar juegos en RAWG' });
  }
}; 