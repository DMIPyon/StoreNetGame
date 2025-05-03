"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../db/database");
// Middleware para verificar el token JWT
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'No se ha proporcionado un token de autenticación'
        });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secretkey');
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};
exports.authenticateJWT = authenticateJWT;
// Middleware para verificar si el usuario es administrador
const isAdmin = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Usuario no autenticado'
        });
    }
    try {
        // Verificar si el usuario tiene rol de administrador
        const result = await database_1.pool.query('SELECT role FROM users WHERE id = $1', [req.user.userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        const userRole = result.rows[0].role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Se requieren permisos de administrador'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error al verificar permisos de administrador:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar permisos',
            error: error.message
        });
    }
};
exports.isAdmin = isAdmin;
