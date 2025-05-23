import { Request, Response } from 'express';
import { pool } from '../db/database';

/**
 * Crear un nuevo juego
 */
export const createGame = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      description, 
      price, 
      discount, 
      cover_url, 
      banner_url,
      developer,
      publisher,
      release_date,
      categories,
      rating
    } = req.body;

    // Validar campos requeridos
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'El nombre y el precio son campos obligatorios'
      });
    }

    // Insertar el juego
    const gameResult = await pool.query(
      `INSERT INTO games (
        name, description, price, discount, cover_url, banner_url, 
        developer, publisher, release_date, rating
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING id`,
      [
        name, 
        description || null, 
        price, 
        discount || 0, 
        cover_url || null, 
        banner_url || null,
        developer || null,
        publisher || null,
        release_date || null,
        rating || 0
      ]
    );

    const gameId = gameResult.rows[0].id;

    // Si hay categorías, asociarlas al juego
    if (categories && Array.isArray(categories) && categories.length > 0) {
      // Crear consulta para insertar múltiples relaciones juego-categoría
      const categoryValues = categories.map((categoryId) => {
        return `(${gameId}, ${categoryId})`;
      }).join(', ');

      await pool.query(
        `INSERT INTO game_categories (game_id, category_id) VALUES ${categoryValues}`
      );
    }

    res.status(201).json({
      success: true,
      message: 'Juego creado exitosamente',
      data: { id: gameId }
    });
  } catch (error) {
    console.error('Error al crear juego:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear juego',
      error: (error as Error).message
    });
  }
};

/**
 * Actualizar un juego existente
 */
export const updateGame = async (req: Request, res: Response) => {
  try {
    const gameId = parseInt(req.params.id);
    const { 
      name, 
      description, 
      price, 
      discount, 
      cover_url, 
      banner_url,
      developer,
      publisher,
      release_date,
      categories,
      rating
    } = req.body;

    if (isNaN(gameId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de juego inválido'
      });
    }

    // Verificar si el juego existe
    const checkGame = await pool.query(
      'SELECT id FROM games WHERE id = $1',
      [gameId]
    );

    if (checkGame.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Juego no encontrado'
      });
    }

    // Actualizar solo los campos proporcionados
    let updateQuery = 'UPDATE games SET ';
    const updateValues = [];
    const updateFields = [];

    if (name !== undefined) {
      updateFields.push(`name = $${updateValues.length + 1}`);
      updateValues.push(name);
    }
    
    if (description !== undefined) {
      updateFields.push(`description = $${updateValues.length + 1}`);
      updateValues.push(description);
    }
    
    if (price !== undefined) {
      updateFields.push(`price = $${updateValues.length + 1}`);
      updateValues.push(price);
    }
    
    if (discount !== undefined) {
      updateFields.push(`discount = $${updateValues.length + 1}`);
      updateValues.push(discount);
    }
    
    if (cover_url !== undefined) {
      updateFields.push(`cover_url = $${updateValues.length + 1}`);
      updateValues.push(cover_url);
    }
    
    if (banner_url !== undefined) {
      updateFields.push(`banner_url = $${updateValues.length + 1}`);
      updateValues.push(banner_url);
    }
    
    if (developer !== undefined) {
      updateFields.push(`developer = $${updateValues.length + 1}`);
      updateValues.push(developer);
    }
    
    if (publisher !== undefined) {
      updateFields.push(`publisher = $${updateValues.length + 1}`);
      updateValues.push(publisher);
    }
    
    if (release_date !== undefined) {
      updateFields.push(`release_date = $${updateValues.length + 1}`);
      updateValues.push(release_date);
    }
    
    if (rating !== undefined) {
      updateFields.push(`rating = $${updateValues.length + 1}`);
      updateValues.push(rating);
    }

    // Si no hay campos para actualizar
    if (updateFields.length === 0 && (!categories || !Array.isArray(categories))) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
    }

    // Si hay campos para actualizar en la tabla games
    if (updateFields.length > 0) {
      // Completar la consulta
      updateQuery += updateFields.join(', ');
      updateQuery += ` WHERE id = $${updateValues.length + 1} RETURNING id`;
      updateValues.push(gameId);

      // Ejecutar la actualización
      await pool.query(updateQuery, updateValues);
    }

    // Si hay categorías, actualizar las relaciones
    if (categories && Array.isArray(categories)) {
      // Eliminar las relaciones existentes
      await pool.query(
        'DELETE FROM game_categories WHERE game_id = $1',
        [gameId]
      );

      // Insertar las nuevas relaciones
      if (categories.length > 0) {
        const categoryValues = categories.map((categoryId) => {
          return `(${gameId}, ${categoryId})`;
        }).join(', ');

        await pool.query(
          `INSERT INTO game_categories (game_id, category_id) VALUES ${categoryValues}`
        );
      }
    }

    res.status(200).json({
      success: true,
      message: 'Juego actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar juego:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar juego',
      error: (error as Error).message
    });
  }
};

/**
 * Eliminar un juego
 */
export const deleteGame = async (req: Request, res: Response) => {
  try {
    const gameId = parseInt(req.params.id);

    if (isNaN(gameId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de juego inválido'
      });
    }

    // Verificar si el juego existe
    const checkGame = await pool.query(
      'SELECT id FROM games WHERE id = $1',
      [gameId]
    );

    if (checkGame.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Juego no encontrado'
      });
    }

    // Primero eliminar las relaciones en game_categories
    await pool.query(
      'DELETE FROM game_categories WHERE game_id = $1',
      [gameId]
    );

    // Eliminar el juego
    await pool.query(
      'DELETE FROM games WHERE id = $1',
      [gameId]
    );

    res.status(200).json({
      success: true,
      message: 'Juego eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar juego:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar juego',
      error: (error as Error).message
    });
  }
}; 