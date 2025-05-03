import { Request, Response } from 'express';
import { pool } from '../config/database';

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