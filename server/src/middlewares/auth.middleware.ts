import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Clave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'netgames_secret_key_2024';

/**
 * Interfaz para incluir el usuario descifrado en la request
 */
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware para verificar el token JWT y establecer el usuario en la request
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener el header de autorización
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Acceso denegado. Token no proporcionado.' 
      });
    }
    
    // Verificar token
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ 
          success: false, 
          message: 'Token inválido o expirado' 
        });
      }
      
      // Token válido, establecer usuario en la request
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Error de autenticación:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error interno de autenticación' 
    });
  }
}; 