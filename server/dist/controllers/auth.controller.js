"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const database_1 = require("../config/database");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Clave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'netgames_secret_key_2024';
/**
 * Controlador para registro de usuarios
 */
const register = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;
        // Validaciones básicas
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren nombre de usuario, correo y contraseña'
            });
        }
        // Verificar si el usuario ya existe
        const existingUser = await database_1.pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'El nombre de usuario o correo ya está en uso'
            });
        }
        // Generar hash de la contraseña
        const saltRounds = 10;
        const passwordHash = await bcrypt_1.default.hash(password, saltRounds);
        // Insertar nuevo usuario
        const result = await database_1.pool.query(`INSERT INTO users (username, email, password_hash, first_name, last_name, profile_image)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, email, first_name, last_name, created_at`, [username, email, passwordHash, firstName || null, lastName || null, 'default-avatar.png']);
        const newUser = result.rows[0];
        // Crear carrito vacío para el usuario
        await database_1.pool.query('INSERT INTO carts (user_id) VALUES ($1)', [newUser.id]);
        // Generar token JWT
        const token = jsonwebtoken_1.default.sign({ id: newUser.id, username: newUser.username, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
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
    }
    catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
};
exports.register = register;
/**
 * Controlador para inicio de sesión
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validaciones básicas
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren correo y contraseña'
            });
        }
        // Buscar usuario por email
        const result = await database_1.pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        // Verificar si el usuario existe
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }
        // Verificar contraseña
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }
        // Generar token JWT
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({
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
    }
    catch (error) {
        console.error('Error en inicio de sesión:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión',
            error: error.message
        });
    }
};
exports.login = login;
/**
 * Obtener perfil de usuario
 */
const getProfile = async (req, res) => {
    try {
        // Usar un ID de usuario temporal (1) ya que no hay autenticación
        const userId = 1;
        const result = await database_1.pool.query(`SELECT id, username, email, first_name, last_name, profile_image, created_at
       FROM users WHERE id = $1`, [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        const user = result.rows[0];
        res.status(200).json({
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
    }
    catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener perfil de usuario',
            error: error.message
        });
    }
};
exports.getProfile = getProfile;
/**
 * Actualizar perfil de usuario
 */
const updateProfile = async (req, res) => {
    try {
        // Usar un ID de usuario temporal (1) ya que no hay autenticación
        const userId = 1;
        const { firstName, lastName, profileImage } = req.body;
        // Actualizar solo los campos proporcionados
        let updateQuery = 'UPDATE users SET ';
        const updateValues = [];
        const updateFields = [];
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
                message: 'No se proporcionaron campos para actualizar'
            });
        }
        // Completar la consulta
        updateQuery += updateFields.join(', ');
        updateQuery += ` WHERE id = $${updateValues.length + 1} RETURNING id, username, email, first_name, last_name, profile_image`;
        updateValues.push(userId);
        // Ejecutar la actualización
        const result = await database_1.pool.query(updateQuery, updateValues);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        const updatedUser = result.rows[0];
        res.status(200).json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                firstName: updatedUser.first_name,
                lastName: updatedUser.last_name,
                profileImage: updatedUser.profile_image
            }
        });
    }
    catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar perfil de usuario',
            error: error.message
        });
    }
};
exports.updateProfile = updateProfile;
/**
 * Cambiar contraseña
 */
const changePassword = async (req, res) => {
    try {
        // Usar un ID de usuario temporal (1) ya que no hay autenticación
        const userId = 1;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren contraseña actual y nueva contraseña'
            });
        }
        // Obtener datos del usuario
        const userResult = await database_1.pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        const user = userResult.rows[0];
        // Verificar contraseña actual
        const isPasswordValid = await bcrypt_1.default.compare(currentPassword, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña actual incorrecta'
            });
        }
        // Generar hash de la nueva contraseña
        const saltRounds = 10;
        const newPasswordHash = await bcrypt_1.default.hash(newPassword, saltRounds);
        // Actualizar contraseña
        await database_1.pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, userId]);
        res.status(200).json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    }
    catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar contraseña',
            error: error.message
        });
    }
};
exports.changePassword = changePassword;
