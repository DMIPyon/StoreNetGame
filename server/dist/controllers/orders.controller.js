"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.createOrder = exports.getOrderDetails = exports.getUserOrders = void 0;
const database_1 = require("../config/database");
const uuid_1 = require("uuid");
/**
 * Obtener todas las órdenes de un usuario
 */
const getUserOrders = async (req, res) => {
    try {
        // Obtener el ID del usuario desde el token JWT
        const userId = req.user.id;
        const orders = await database_1.pool.query(`SELECT id, order_number, total_amount, status, payment_method, created_at 
       FROM orders 
       WHERE user_id = $1
       ORDER BY created_at DESC`, [userId]);
        res.status(200).json({
            success: true,
            data: orders.rows
        });
    }
    catch (error) {
        console.error('Error al obtener órdenes del usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el historial de órdenes',
            error: error.message
        });
    }
};
exports.getUserOrders = getUserOrders;
/**
 * Obtener detalles de una orden específica
 */
const getOrderDetails = async (req, res) => {
    try {
        // Obtener el ID del usuario desde el token JWT
        const userId = req.user.id;
        const orderId = req.params.id;
        // Obtener información de la orden
        const orderResult = await database_1.pool.query(`SELECT * FROM orders WHERE id = $1 AND user_id = $2`, [orderId, userId]);
        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }
        const order = orderResult.rows[0];
        // Obtener items de la orden
        const itemsResult = await database_1.pool.query(`SELECT oi.id, oi.quantity, oi.price_at_purchase, g.title, g.image_url 
       FROM order_items oi
       JOIN games g ON oi.game_id = g.id
       WHERE oi.order_id = $1`, [orderId]);
        res.status(200).json({
            success: true,
            data: {
                order,
                items: itemsResult.rows
            }
        });
    }
    catch (error) {
        console.error('Error al obtener detalles de la orden:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener detalles de la orden',
            error: error.message
        });
    }
};
exports.getOrderDetails = getOrderDetails;
/**
 * Crear una nueva orden a partir del carrito actual
 */
const createOrder = async (req, res) => {
    const client = await database_1.pool.connect();
    try {
        await client.query('BEGIN');
        // Obtener el ID del usuario desde el token JWT
        const userId = req.user.id;
        const { paymentMethod, shippingAddress } = req.body;
        // Obtener el carrito del usuario
        const cartResult = await client.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
        if (cartResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Carrito no encontrado'
            });
        }
        const cartId = cartResult.rows[0].id;
        // Obtener los items del carrito
        const cartItemsResult = await client.query(`SELECT ci.game_id, ci.quantity, g.price, g.title
       FROM cart_items ci
       JOIN games g ON ci.game_id = g.id
       WHERE ci.cart_id = $1`, [cartId]);
        if (cartItemsResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'El carrito está vacío'
            });
        }
        // Calcular el monto total
        let totalAmount = 0;
        for (const item of cartItemsResult.rows) {
            totalAmount += parseFloat(item.price) * item.quantity;
        }
        // Generar número de orden único
        const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${(0, uuid_1.v4)().slice(0, 4)}`;
        // Crear la orden
        const orderResult = await client.query(`INSERT INTO orders (user_id, total_amount, status, payment_method, shipping_address, order_number)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`, [userId, totalAmount, 'completed', paymentMethod, shippingAddress, orderNumber]);
        const orderId = orderResult.rows[0].id;
        // Insertar items de la orden
        for (const item of cartItemsResult.rows) {
            await client.query(`INSERT INTO order_items (order_id, game_id, price_at_purchase, quantity)
         VALUES ($1, $2, $3, $4)`, [orderId, item.game_id, item.price, item.quantity]);
            // Actualizar el contador de juegos vendidos
            await client.query(`UPDATE games SET sold_count = sold_count + $1 WHERE id = $2`, [item.quantity, item.game_id]);
        }
        // Vaciar el carrito
        await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
        await client.query('COMMIT');
        res.status(201).json({
            success: true,
            message: 'Orden creada exitosamente',
            data: {
                orderId,
                orderNumber
            }
        });
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al crear la orden:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar la orden',
            error: error.message
        });
    }
    finally {
        client.release();
    }
};
exports.createOrder = createOrder;
/**
 * Cancelar una orden (si está en estado pendiente)
 */
const cancelOrder = async (req, res) => {
    try {
        // Obtener el ID del usuario desde el token JWT
        const userId = req.user.id;
        const orderId = req.params.id;
        // Verificar que la orden existe y pertenece al usuario
        const orderResult = await database_1.pool.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [orderId, userId]);
        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }
        const order = orderResult.rows[0];
        // Solo se pueden cancelar órdenes pendientes
        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden cancelar órdenes en estado pendiente'
            });
        }
        // Actualizar estado de la orden
        await database_1.pool.query('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['cancelled', orderId]);
        res.status(200).json({
            success: true,
            message: 'Orden cancelada exitosamente'
        });
    }
    catch (error) {
        console.error('Error al cancelar la orden:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cancelar la orden',
            error: error.message
        });
    }
};
exports.cancelOrder = cancelOrder;
