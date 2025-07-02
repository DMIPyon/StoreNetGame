import { Request, Response } from 'express';
import { pool } from '../db/database';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env['EMAIL_USER'], // tu correo
    pass: process.env['EMAIL_PASS']  // tu contraseña o app password
  }
});

// Obtener todos los pedidos (para administradores)
export const getOrders = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
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
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los pedidos',
      error: (error as Error).message
    });
  }
};

// Obtener un pedido específico por ID (para administradores)
export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
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
  } catch (error) {
    console.error(`Error al obtener pedido con ID ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el pedido',
      error: (error as Error).message
    });
  }
};

// Actualizar el estado de un pedido (para administradores)
export const updateOrderStatus = async (req: Request, res: Response) => {
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
    const result = await pool.query(`
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
  } catch (error) {
    console.error(`Error al actualizar el estado del pedido con ID ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado del pedido',
      error: (error as Error).message
    });
  }
};

export const checkout = async (req: Request, res: Response) => {
  const { email, cart } = req.body;

  if (!email || !cart || !Array.isArray(cart)) {
    return res.status(400).json({ success: false, message: 'Datos incompletos' });
  }

  // Simula un código de producto
  const codigo = Math.random().toString(36).substring(2, 10).toUpperCase();

  try {
    await transporter.sendMail({
      from: '"NetGames" <no-reply@netgames.com>',
      to: email,
      subject: '¡Gracias por tu compra!',
      html: `
        <h2>¡Gracias por tu compra!</h2>
        <p>Tu código de producto es: <b>${codigo}</b></p>
        <p>Resumen de tu compra:</p>
        <ul>
          ${cart.map((item: any) => `<li>${item.title} x${item.quantity} - $${item.price}</li>`).join('')}
        </ul>
      `
    });

    return res.json({ success: true, message: 'Correo enviado', codigo });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error enviando el correo', error: err });
  }
}; 