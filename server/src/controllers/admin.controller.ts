import { Request, Response } from 'express';
import { pool } from '../config/database';

/**
 * Obtener todos los usuarios
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, first_name, last_name, profile_image, role, created_at
       FROM users
       ORDER BY id ASC`
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: (error as Error).message
    });
  }
};

/**
 * Obtener un usuario por ID
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params['id']);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }
    const result = await pool.query(
      `SELECT id, username, email, first_name, last_name, profile_image, role, created_at
       FROM users WHERE id = $1`,
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    return res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: (error as Error).message
    });
  }
};

/**
 * Actualizar un usuario
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params['id']);
    const { username, email, firstName, lastName, profileImage, role } = req.body;
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }
    // Verificar si el usuario existe
    const checkUser = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );
    if (checkUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    // Actualizar solo los campos proporcionados
    let updateQuery = 'UPDATE users SET ';
    const updateValues = [];
    const updateFields = [];
    if (username !== undefined) {
      updateFields.push(`username = $${updateValues.length + 1}`);
      updateValues.push(username);
    }
    if (email !== undefined) {
      updateFields.push(`email = $${updateValues.length + 1}`);
      updateValues.push(email);
    }
    if (firstName !== undefined) {
      updateFields.push(`first_name = $${updateValues.length + 1}`);
      updateValues.push(firstName);
    }
    if (lastName !== undefined) {
      updateFields.push(`last_name = $${updateValues.length + 1}`);
      updateValues.push(lastName);
    }
    if (profileImage !== undefined) {
      updateFields.push(`profile_image = $${updateValues.length + 1}`);
      updateValues.push(profileImage);
    }
    if (role !== undefined) {
      updateFields.push(`role = $${updateValues.length + 1}`);
      updateValues.push(role);
    }
    // Si no hay campos para actualizar
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
    }
    // Completar la consulta
    updateQuery += updateFields.join(', ');
    updateQuery += ` WHERE id = $${updateValues.length + 1} RETURNING id, username, email, first_name, last_name, profile_image, role`;
    updateValues.push(userId);
    // Ejecutar la actualización
    const result = await pool.query(updateQuery, updateValues);
    return res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: (error as Error).message
    });
  }
};

/**
 * Eliminar un usuario
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params['id']);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }
    // Verificar si el usuario existe
    const checkUser = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );
    if (checkUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    // Proteger contra eliminación de usuario administrador principal (ID 1)
    if (userId === 1) {
      return res.status(403).json({
        success: false,
        message: 'No se puede eliminar al administrador principal'
      });
    }
    // Eliminar el usuario
    await pool.query(
      'DELETE FROM users WHERE id = $1',
      [userId]
    );
    return res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: (error as Error).message
    });
  }
};

/**
 * Obtener estadísticas para el dashboard de admin
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Consulta para obtener conteo de usuarios
    const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
    
    // Consulta para obtener conteo de juegos
    const gamesCount = await pool.query('SELECT COUNT(*) as count FROM games');
    
    // Consulta para obtener conteo de órdenes
    const ordersCount = await pool.query('SELECT COUNT(*) as count FROM orders');
    
    // Consulta para obtener conteo de categorías
    const categoriesCount = await pool.query('SELECT COUNT(*) as count FROM categories');
    
    // Consulta para obtener los ingresos totales
    const totalRevenue = await pool.query('SELECT SUM(total) as revenue FROM orders WHERE status = $1', ['completed']);
    
    // Consulta para obtener ventas recientes (últimos 30 días)
    const recentSales = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE created_at > NOW() - INTERVAL \'30 days\''
    );
    
    res.status(200).json({
      success: true,
      totalUsers: parseInt(usersCount.rows[0].count),
      totalGames: parseInt(gamesCount.rows[0].count),
      totalOrders: parseInt(ordersCount.rows[0].count),
      totalCategories: parseInt(categoriesCount.rows[0].count),
      recentSales: parseInt(recentSales.rows[0].count),
      totalRevenue: totalRevenue.rows[0].revenue || 0
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: (error as Error).message
    });
  }
}; 