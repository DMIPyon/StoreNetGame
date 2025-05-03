import { Request, Response } from 'express';
import { pool } from '../db/database';

// Crear un nuevo juego
export const createGame = async (req: Request, res: Response) => {
  const {
    title,
    price,
    discount = 0,
    description = '',
    cover_url = '',
    banner_url = '',
    developer = '',
    release_date = new Date().toISOString().split('T')[0],
    category_ids = []
  } = req.body;

  if (!title || !price) {
    return res.status(400).json({
      success: false,
      message: 'El título y el precio son campos obligatorios'
    });
  }

  try {
    const client = await pool.connect();
    
    try {
      // Comenzar transacción
      await client.query('BEGIN');
      
      // Insertar el juego
      const gameResult = await client.query(
        `INSERT INTO games (title, price, discount, description, cover_url, banner_url, developer, release_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [title, price, discount, description, cover_url, banner_url, developer, release_date]
      );
      
      const game = gameResult.rows[0];
      
      // Asociar categorías si se proporcionaron
      if (category_ids.length > 0) {
        const gameId = game.id;
        
        // Crear consulta para insertar múltiples asociaciones game-category
        const values = category_ids.map((catId: number, index: number) => 
          `($1, $${index + 2})`
        ).join(', ');
        
        const params = [gameId, ...category_ids];
        
        await client.query(
          `INSERT INTO game_categories (game_id, category_id) 
           VALUES ${values}`,
          params
        );
      }
      
      // Commit de la transacción
      await client.query('COMMIT');
      
      // Obtener el juego con sus categorías
      const completeGameResult = await client.query(
        `SELECT g.*, array_agg(c.id) as category_ids, array_agg(c.name) as categories
         FROM games g
         LEFT JOIN game_categories gc ON g.id = gc.game_id
         LEFT JOIN categories c ON gc.category_id = c.id
         WHERE g.id = $1
         GROUP BY g.id`,
        [game.id]
      );
      
      return res.status(201).json({
        success: true,
        message: 'Juego creado con éxito',
        data: completeGameResult.rows[0]
      });
    } catch (err) {
      // Rollback en caso de error
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al crear juego:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear el juego',
      error: (error as Error).message
    });
  }
};

// Actualizar un juego existente
export const updateGame = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    title,
    price,
    discount,
    description,
    cover_url,
    banner_url,
    developer,
    release_date,
    category_ids
  } = req.body;

  try {
    const client = await pool.connect();
    
    try {
      // Comenzar transacción
      await client.query('BEGIN');
      
      // Construir consulta dinámica para actualizar solo los campos proporcionados
      let updateQuery = 'UPDATE games SET ';
      const values: any[] = [];
      let paramCount = 1;
      
      // Añadir cada campo a la consulta si existe en el cuerpo de la solicitud
      if (title !== undefined) {
        updateQuery += `title = $${paramCount++}, `;
        values.push(title);
      }
      
      if (price !== undefined) {
        updateQuery += `price = $${paramCount++}, `;
        values.push(price);
      }
      
      if (discount !== undefined) {
        updateQuery += `discount = $${paramCount++}, `;
        values.push(discount);
      }
      
      if (description !== undefined) {
        updateQuery += `description = $${paramCount++}, `;
        values.push(description);
      }
      
      if (cover_url !== undefined) {
        updateQuery += `cover_url = $${paramCount++}, `;
        values.push(cover_url);
      }
      
      if (banner_url !== undefined) {
        updateQuery += `banner_url = $${paramCount++}, `;
        values.push(banner_url);
      }
      
      if (developer !== undefined) {
        updateQuery += `developer = $${paramCount++}, `;
        values.push(developer);
      }
      
      if (release_date !== undefined) {
        updateQuery += `release_date = $${paramCount++}, `;
        values.push(release_date);
      }
      
      // Si no hay campos para actualizar, salir
      if (values.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionaron campos para actualizar'
        });
      }
      
      // Eliminar la coma final y añadir la condición WHERE
      updateQuery = updateQuery.slice(0, -2);
      updateQuery += ` WHERE id = $${paramCount} RETURNING *`;
      values.push(id);
      
      // Ejecutar la actualización
      const gameResult = await client.query(updateQuery, values);
      
      if (gameResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: `No se encontró un juego con ID ${id}`
        });
      }
      
      // Actualizar categorías si se proporcionaron
      if (category_ids !== undefined) {
        // Eliminar las asociaciones existentes
        await client.query(
          'DELETE FROM game_categories WHERE game_id = $1',
          [id]
        );
        
        // Insertar nuevas asociaciones
        if (category_ids.length > 0) {
          const values = category_ids.map((catId: number, index: number) => 
            `($1, $${index + 2})`
          ).join(', ');
          
          const params = [id, ...category_ids];
          
          await client.query(
            `INSERT INTO game_categories (game_id, category_id) 
             VALUES ${values}`,
            params
          );
        }
      }
      
      // Commit de la transacción
      await client.query('COMMIT');
      
      // Obtener el juego actualizado con sus categorías
      const completeGameResult = await client.query(
        `SELECT g.*, array_agg(c.id) as category_ids, array_agg(c.name) as categories
         FROM games g
         LEFT JOIN game_categories gc ON g.id = gc.game_id
         LEFT JOIN categories c ON gc.category_id = c.id
         WHERE g.id = $1
         GROUP BY g.id`,
        [id]
      );
      
      return res.status(200).json({
        success: true,
        message: 'Juego actualizado con éxito',
        data: completeGameResult.rows[0]
      });
      
    } catch (err) {
      // Rollback en caso de error
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error al actualizar juego con ID ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el juego',
      error: (error as Error).message
    });
  }
};

// Eliminar un juego
export const deleteGame = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const client = await pool.connect();
    
    try {
      // Comenzar transacción
      await client.query('BEGIN');
      
      // Primero eliminar las referencias en otras tablas
      
      // Eliminar asociaciones con categorías
      await client.query(
        'DELETE FROM game_categories WHERE game_id = $1',
        [id]
      );
      
      // Eliminar elementos de carro relacionados (si existe la tabla)
      try {
        // Verificar primero si la tabla existe
        const tableCheck = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'cart_items'
          );
        `);
        
        // Solo intentar eliminar si la tabla existe
        if (tableCheck.rows[0].exists) {
          await client.query(
            'DELETE FROM cart_items WHERE game_id = $1',
            [id]
          );
        }
      } catch (error) {
        // Si hay otro tipo de error, ignorarlo pero registrarlo
        console.log('Nota: Error al acceder a la tabla cart_items:', error);
      }
      
      // Finalmente eliminar el juego
      const result = await client.query(
        'DELETE FROM games WHERE id = $1 RETURNING id',
        [id]
      );
      
      // Commit de la transacción
      await client.query('COMMIT');
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No se encontró un juego con ID ${id}`
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Juego eliminado con éxito',
        data: { id: parseInt(id) }
      });
      
    } catch (err) {
      // Rollback en caso de error
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error al eliminar juego con ID ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el juego',
      error: (error as Error).message
    });
  }
}; 