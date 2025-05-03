import { Request, Response } from 'express';
import { pool } from '../db/database';

// Estructura de categoría predeterminada
interface Category {
  name: string;
  icon?: string;
}

// Categorías predefinidas
const defaultCategories: Category[] = [
  { name: 'Acción', icon: 'flame-outline' },
  { name: 'Aventura', icon: 'map-outline' },
  { name: 'RPG', icon: 'game-controller-outline' },
  { name: 'Estrategia', icon: 'bulb-outline' },
  { name: 'Deportes', icon: 'football-outline' },
  { name: 'Simulación', icon: 'airplane-outline' },
  { name: 'Casual', icon: 'happy-outline' },
  { name: 'Indie', icon: 'flash-outline' },
  { name: 'Carreras', icon: 'car-sport-outline' },
  { name: 'Shooter', icon: 'aperture-outline' },
  { name: 'Puzzle', icon: 'extension-puzzle-outline' },
  { name: 'Terror', icon: 'skull-outline' },
  { name: 'Plataformas', icon: 'layers-outline' },
  { name: 'Lucha', icon: 'fist-outline' },
  { name: 'Sandbox', icon: 'cube-outline' }
];

// Obtener todas las categorías
export const getCategories = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener una categoría por ID
export const getCategoryById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear una nueva categoría
export const createCategory = async (req: Request, res: Response) => {
  const { name, icon = null, color = null } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'El nombre de la categoría es obligatorio'
    });
  }

  try {
    // Verificar si ya existe una categoría con el mismo nombre
    const existingCategory = await pool.query(
      'SELECT * FROM categories WHERE LOWER(name) = LOWER($1)',
      [name]
    );

    if (existingCategory.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Ya existe una categoría con el nombre ${name}`
      });
    }

    // Insertar la nueva categoría
    const result = await pool.query(
      'INSERT INTO categories (name, icon, color) VALUES ($1, $2, $3) RETURNING *',
      [name, icon, color]
    );

    return res.status(201).json({
      success: true,
      message: 'Categoría creada con éxito',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear la categoría',
      error: (error as Error).message
    });
  }
};

// Actualizar una categoría existente
export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, icon, color } = req.body;

  // Validar que se proporcione al menos un campo para actualizar
  if (!name && icon === undefined && color === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Debe proporcionar al menos un campo para actualizar'
    });
  }

  try {
    // Verificar si la categoría existe
    const category = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );

    if (category.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No se encontró una categoría con ID ${id}`
      });
    }

    // Si se proporciona un nombre, verificar que no exista ya otra categoría con ese nombre
    if (name) {
      const existingCategory = await pool.query(
        'SELECT * FROM categories WHERE LOWER(name) = LOWER($1) AND id <> $2',
        [name, id]
      );

      if (existingCategory.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Ya existe otra categoría con el nombre ${name}`
        });
      }
    }

    // Construir consulta dinámica para actualizar solo los campos proporcionados
    let updateQuery = 'UPDATE categories SET ';
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateQuery += `name = $${paramCount++}, `;
      values.push(name);
    }

    if (icon !== undefined) {
      updateQuery += `icon = $${paramCount++}, `;
      values.push(icon);
    }

    if (color !== undefined) {
      updateQuery += `color = $${paramCount++}, `;
      values.push(color);
    }

    // Eliminar la coma final y añadir la condición WHERE
    updateQuery = updateQuery.slice(0, -2);
    updateQuery += ` WHERE id = $${paramCount} RETURNING *`;
    values.push(id);

    // Ejecutar la actualización
    const result = await pool.query(updateQuery, values);

    return res.status(200).json({
      success: true,
      message: 'Categoría actualizada con éxito',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(`Error al actualizar categoría con ID ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar la categoría',
      error: (error as Error).message
    });
  }
};

// Eliminar una categoría
export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Verificar si la categoría existe
    const category = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );

    if (category.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No se encontró una categoría con ID ${id}`
      });
    }

    // Verificar si la categoría está en uso en algún juego
    const inUse = await pool.query(
      'SELECT COUNT(*) FROM game_categories WHERE category_id = $1',
      [id]
    );

    if (parseInt(inUse.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar la categoría porque está siendo utilizada por ${inUse.rows[0].count} juegos`
      });
    }

    // Eliminar la categoría
    await pool.query(
      'DELETE FROM categories WHERE id = $1',
      [id]
    );

    return res.status(200).json({
      success: true,
      message: 'Categoría eliminada con éxito',
      data: { id: parseInt(id) }
    });
  } catch (error) {
    console.error(`Error al eliminar categoría con ID ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar la categoría',
      error: (error as Error).message
    });
  }
};

// Inicializar categorías predefinidas
export const initializeCategories = async () => {
  try {
    // Verificar si ya existen categorías
    const result = await pool.query('SELECT COUNT(*) FROM categories');
    
    if (parseInt(result.rows[0].count) === 0) {
      console.log('Inicializando categorías...');
      
      // Insertar categorías predefinidas
      for (const category of defaultCategories) {
        await pool.query(
          'INSERT INTO categories (name, icon) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
          [category.name, category.icon]
        );
      }
      
      console.log('✅ Categorías inicializadas correctamente');
    } else {
      console.log('✅ Las categorías ya existen en la base de datos');
    }
  } catch (error) {
    console.error('❌ Error al inicializar categorías:', error);
  }
}; 