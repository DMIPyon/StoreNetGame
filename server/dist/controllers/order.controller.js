"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getOrderById = exports.getOrders = void 0;
const database_1 = require("../db/database");
// Obtener todos los pedidos (para administradores)
const getOrders = async (req, res) => {
    try {
        const result = await database_1.pool.query(`
      SELECT o.*, 
             u.username, 
             u.email,
             COUNT(oi.id) as item_count,
             json_agg(json_build_object(
               'id', oi.id,
               'game_id', oi.game_id,
               'quantity', oi.quantity,
               'price', oi.price,
               'title', g.title,
               'cover_url', g.cover_url
             )) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN games g ON oi.game_id = g.id
      GROUP BY o.id, u.username, u.email
      ORDER BY o.created_at DESC
    `);
        return res.status(200).json({
            success: true,
            data: result.rows
        });
    }
    catch (error) {
        console.error('Error al obtener pedidos:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los pedidos',
            error: error.message
        });
    }
};
exports.getOrders = getOrders;
// Obtener un pedido específico por ID (para administradores)
const getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await database_1.pool.query(`
      SELECT o.*, 
             u.username, 
             u.email,
             json_agg(json_build_object(
               'id', oi.id,
               'game_id', oi.game_id,
               'quantity', oi.quantity,
               'price', oi.price,
               'title', g.title,
               'cover_url', g.cover_url
             )) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN games g ON oi.game_id = g.id
      WHERE o.id = $1
      GROUP BY o.id, u.username, u.email
    `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No se encontró un pedido con ID ${id}`
            });
        }
        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    }
    catch (error) {
        console.error(`Error al obtener pedido con ID ${id}:`, error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el pedido',
            error: error.message
        });
    }
};
exports.getOrderById = getOrderById;
// Actualizar el estado de un pedido (para administradores)
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    // Validar el estado
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Estado no válido. Los estados permitidos son: ${validStatuses.join(', ')}`
        });
    }
    try {
        const result = await database_1.pool.query(`
      UPDATE orders
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [status, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No se encontró un pedido con ID ${id}`
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Estado del pedido actualizado con éxito',
            data: result.rows[0]
        });
    }
    catch (error) {
        console.error(`Error al actualizar el estado del pedido con ID ${id}:`, error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar el estado del pedido',
            error: error.message
        });
    }
};
exports.updateOrderStatus = updateOrderStatus;
