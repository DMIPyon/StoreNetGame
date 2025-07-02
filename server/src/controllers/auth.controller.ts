import { Request, Response } from 'express';
import { pool } from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import validator from 'validator';

dotenv.config();

// Clave secreta para JWT
const JWT_SECRET = process.env['JWT_SECRET'] || 'netgames_secret_key_2024';

/**
 * Controlador para registro de usuarios
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Validaciones básicas
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Se requieren nombre de usuario, correo y contraseña', error: 'Campos obligatorios faltantes' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Correo inválido', error: 'Formato de correo inválido' });
    }
    if (!validator.isAlphanumeric(username)) {
      return res.status(400).json({ success: false, message: 'El nombre de usuario solo puede contener letras y números', error: 'Username inválido' });
    }
    if (username.length > 30 || email.length > 30) {
      return res.status(400).json({ success: false, message: 'El nombre de usuario y el correo deben tener máximo 30 caracteres', error: 'Longitud excedida' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres', error: 'Contraseña muy corta' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'El nombre de usuario o correo ya está en uso' 
      });
    }

    // Generar hash de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insertar nuevo usuario
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, profile_image)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, email, first_name, last_name, created_at`,
      [username, email, passwordHash, firstName || null, lastName || null, 'default-avatar.png']
    );

    const newUser = result.rows[0];

    // Crear carrito vacío para el usuario
    await pool.query(
      'INSERT INTO carts (user_id) VALUES ($1)',
      [newUser.id]
    );

    // Generar token JWT
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          createdAt: newUser.created_at
        },
        token
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al registrar usuario',
      error: (error as Error).message
    });
  }
};

/**
 * Controlador para inicio de sesión
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Se requieren correo y contraseña' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Correo inválido' });
    }

    // Buscar usuario por email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    // Verificar si el usuario existe
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          profileImage: user.profile_image,
          createdAt: user.created_at
        },
        token
      }
    });

  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al iniciar sesión',
      error: (error as Error).message
    });
  }
};

/**
 * Obtener perfil de usuario
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    // Obtener el ID del usuario autenticado desde el token JWT
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const result = await pool.query(
      `SELECT id, username, email, first_name, last_name, profile_image, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    const user = result.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profileImage: user.profile_image,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al obtener perfil de usuario',
      error: (error as Error).message
    });
  }
};

/**
 * Actualizar perfil de usuario
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    // Obtener el ID del usuario autenticado desde el token JWT
    const userId = req.user?.userId;
    const { firstName, lastName, profileImage } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    // Actualizar solo los campos proporcionados
    let updateQuery = 'UPDATE users SET ';
    const updateValues: any[] = [];
    const updateFields: string[] = [];

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

    // Si no hay campos para actualizar
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
    }

    // Completar la consulta
    updateQuery += updateFields.join(', ');
    updateQuery += ` WHERE id = $${updateValues.length + 1} RETURNING id, username, email, first_name, last_name, profile_image`;
    updateValues.push(userId);

    // Ejecutar la actualización
    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const updatedUser = result.rows[0];

    return res.status(200).json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar perfil',
      error: (error as Error).message
    });
  }
};

/**
 * Cambiar contraseña
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    // Obtener el ID del usuario autenticado desde el token JWT
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren contraseña actual y nueva contraseña'
      });
    }

    // Obtener datos del usuario
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = userResult.rows[0];

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Generar hash de la nueva contraseña
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al cambiar contraseña',
      error: (error as Error).message
    });
  }
}; 