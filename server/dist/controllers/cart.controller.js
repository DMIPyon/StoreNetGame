"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuthStatus = exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addItemToCart = exports.getCart = void 0;
const database_1 = require("../config/database");
// ID de sesión temporal para carrito anónimo
const ANONYMOUS_USER_ID = 999;
/**
 * Obtener el carrito del usuario actual
 */
const getCart = async (req, res) => {
    try {
        // Usar un ID fijo para usuario anónimo
        const userId = ANONYMOUS_USER_ID;
        // Obtener el carrito del usuario
        const cartResult = await database_1.pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
        // Si el usuario no tiene carrito, crear uno nuevo
        let cartId;
        if (cartResult.rows.length === 0) {
            const newCartResult = await database_1.pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId]);
            cartId = newCartResult.rows[0].id;
        }
        else {
            cartId = cartResult.rows[0].id;
        }
        // Obtener los items del carrito con información del juego
        const cartItemsResult = await database_1.pool.query(`SELECT ci.id, ci.game_id, ci.quantity, g.title, g.price, g.cover_url, g.discount, g.original_price
       FROM cart_items ci
       JOIN games g ON ci.game_id = g.id
       WHERE ci.cart_id = $1`, [cartId]);
        // Calcular el total del carrito
        let totalAmount = 0;
        const items = cartItemsResult.rows.map((item) => {
            const itemTotal = parseFloat(item.price) * item.quantity;
            totalAmount += itemTotal;
            return {
                ...item,
                itemTotal
            };
        });
        res.status(200).json({
            success: true,
            data: {
                cartId,
                items,
                totalAmount,
                itemCount: items.length
            }
        });
    }
    catch (error) {
        console.error('Error al obtener carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el carrito',
            error: error.message
        });
    }
};
exports.getCart = getCart;
/**
 * Añadir un item al carrito
 */
const addItemToCart = async (req, res) => {
    try {
        // Usar un ID fijo para usuario anónimo
        const userId = ANONYMOUS_USER_ID;
        const { gameId, quantity = 1 } = req.body;
        console.log('Añadiendo al carrito:', { gameId, quantity, userId });
        if (!gameId) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere el ID del juego'
            });
        }
        // Verificar si el juego existe
        const gameResult = await database_1.pool.query('SELECT id, title, price FROM games WHERE id = $1', [gameId]);
        if (gameResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Juego no encontrado'
            });
        }
        // Obtener o crear un carrito para el usuario
        let cartResult = await database_1.pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
        let cartId;
        if (cartResult.rows.length === 0) {
            // Crear nuevo carrito
            console.log('Creando nuevo carrito para usuario:', userId);
            const newCartResult = await database_1.pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId]);
            cartId = newCartResult.rows[0].id;
        }
        else {
            cartId = cartResult.rows[0].id;
            console.log('Usando carrito existente:', cartId);
        }
        // Verificar si el juego ya está en el carrito
        const existingItemResult = await database_1.pool.query('SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND game_id = $2', [cartId, gameId]);
        if (existingItemResult.rows.length > 0) {
            // Actualizar cantidad si ya existe
            const newQuantity = existingItemResult.rows[0].quantity + quantity;
            console.log('Actualizando cantidad de item existente:', {
                itemId: existingItemResult.rows[0].id,
                oldQuantity: existingItemResult.rows[0].quantity,
                newQuantity
            });
            await database_1.pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [newQuantity, existingItemResult.rows[0].id]);
        }
        else {
            // Agregar nuevo item al carrito
            console.log('Agregando nuevo item al carrito:', { cartId, gameId, quantity });
            await database_1.pool.query('INSERT INTO cart_items (cart_id, game_id, quantity) VALUES ($1, $2, $3)', [cartId, gameId, quantity]);
        }
        // Actualizar fecha de última actualización del carrito
        await database_1.pool.query('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [cartId]);
        res.status(200).json({
            success: true,
            message: 'Producto añadido al carrito',
            data: {
                gameId,
                gameTitle: gameResult.rows[0].title,
                quantity
            }
        });
    }
    catch (error) {
        console.error('Error al añadir item al carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error al añadir producto al carrito',
            error: error.message
        });
    }
};
exports.addItemToCart = addItemToCart;
/**
 * Actualizar cantidad de un item en el carrito
 */
const updateCartItem = async (req, res) => {
    try {
        // Usar un ID fijo para usuario anónimo
        const userId = ANONYMOUS_USER_ID;
        const { itemId } = req.params;
        const { quantity } = req.body;
        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad debe ser un número positivo'
            });
        }
        // Verificar que el item pertenece al carrito del usuario
        const itemResult = await database_1.pool.query(`SELECT ci.id, ci.cart_id, ci.game_id, g.title
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       JOIN games g ON ci.game_id = g.id
       WHERE ci.id = $1 AND c.user_id = $2`, [itemId, userId]);
        if (itemResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item no encontrado en el carrito'
            });
        }
        // Actualizar cantidad
        await database_1.pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [quantity, itemId]);
        // Actualizar fecha de última actualización del carrito
        await database_1.pool.query('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [itemResult.rows[0].cart_id]);
        res.status(200).json({
            success: true,
            message: 'Cantidad actualizada',
            data: {
                itemId,
                gameId: itemResult.rows[0].game_id,
                gameTitle: itemResult.rows[0].title,
                quantity
            }
        });
    }
    catch (error) {
        console.error('Error al actualizar item del carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la cantidad',
            error: error.message
        });
    }
};
exports.updateCartItem = updateCartItem;
/**
 * Eliminar un item del carrito
 */
const removeFromCart = async (req, res) => {
    try {
        // Usar un ID fijo para usuario anónimo
        const userId = ANONYMOUS_USER_ID;
        const { itemId } = req.params;
        // Verificar que el item pertenece al carrito del usuario
        const itemResult = await database_1.pool.query(`SELECT ci.id, ci.cart_id, g.title 
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       JOIN games g ON ci.game_id = g.id
       WHERE ci.id = $1 AND c.user_id = $2`, [itemId, userId]);
        if (itemResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item no encontrado en el carrito'
            });
        }
        // Eliminar item
        await database_1.pool.query('DELETE FROM cart_items WHERE id = $1', [itemId]);
        // Actualizar fecha de última actualización del carrito
        await database_1.pool.query('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [itemResult.rows[0].cart_id]);
        res.status(200).json({
            success: true,
            message: 'Producto eliminado del carrito'
        });
    }
    catch (error) {
        console.error('Error al eliminar item del carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar producto del carrito',
            error: error.message
        });
    }
};
exports.removeFromCart = removeFromCart;
/**
 * Vaciar todo el carrito
 */
const clearCart = async (req, res) => {
    try {
        // Usar un ID fijo para usuario anónimo
        const userId = ANONYMOUS_USER_ID;
        // Obtener el carrito del usuario
        const cartResult = await database_1.pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
        if (cartResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Carrito no encontrado'
            });
        }
        const cartId = cartResult.rows[0].id;
        // Eliminar todos los items del carrito
        await database_1.pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
        // Actualizar fecha de última actualización del carrito
        await database_1.pool.query('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [cartId]);
        res.status(200).json({
            success: true,
            message: 'Carrito vaciado correctamente'
        });
    }
    catch (error) {
        console.error('Error al vaciar el carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error al vaciar el carrito',
            error: error.message
        });
    }
};
exports.clearCart = clearCart;
/**
 * Verificar el estado de autenticación del usuario
 */
const checkAuthStatus = async (req, res) => {
    try {
        // Comprobar si hay un token de autenticación
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"
        if (!token) {
            return res.status(200).json({
                success: true,
                isAuthenticated: false,
                message: 'Debes iniciar sesión para completar la compra'
            });
        }
        // Si hay token, el usuario está autenticado
        return res.status(200).json({
            success: true,
            isAuthenticated: true
        });
    }
    catch (error) {
        console.error('Error al verificar estado de autenticación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar estado de autenticación',
            error: error.message
        });
    }
};
exports.checkAuthStatus = checkAuthStatus;
