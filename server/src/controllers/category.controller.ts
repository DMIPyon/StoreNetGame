import { Request, Response } from 'express';
import { pool } from '../config/database';

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
  try {
    const { name, icon } = req.body;
    
    // Validar que el nombre esté presente
    if (!name) {
      return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
    }
    
    // Insertar la categoría en la base de datos
    const result = await pool.query(
      'INSERT INTO categories (name, icon) VALUES ($1, $2) RETURNING *',
      [name, icon]
    );
    
    res.status(201).json({ 
      message: 'Categoría creada correctamente',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

// Actualizar una categoría
export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, icon } = req.body;
  
  try {
    // Validar que el nombre esté presente
    if (!name) {
      return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
    }
    
    const result = await pool.query(
      'UPDATE categories SET name = $1, icon = $2 WHERE id = $3 RETURNING *',
      [name, icon, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    res.json({ 
      message: 'Categoría actualizada correctamente',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
};

// Eliminar una categoría
export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    // Verificar si la categoría existe
    const checkResult = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    // Verificar si hay juegos asociados a esta categoría
    const gamesResult = await pool.query('SELECT COUNT(*) FROM games WHERE category_id = $1', [id]);
    
    if (parseInt(gamesResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la categoría porque hay juegos asociados a ella'
      });
    }
    
    // Eliminar la categoría
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ error: 'Error al eliminar categoría' });
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