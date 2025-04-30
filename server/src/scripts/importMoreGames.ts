import { pool } from '../config/database';
import { getGamesByGenre, getGameDetails, convertRawgGameToOurFormat } from '../services/rawgApi';

// Géneros adicionales para importar
const ADDITIONAL_GENRES = [
  'sports',
  'fighting',
  'strategy',
  'simulation',
  'puzzle',
  'platformer',
  'massively-multiplayer',
  'family',
  'card',
  'board-games',
  'educational',
  'casual'
];

// Plataformas adicionales (IDs de RAWG)
const ADDITIONAL_PLATFORMS = [
  1,   // PC
  187, // PlayStation 5
  186, // Xbox Series S/X
  7,   // Nintendo Switch
  18,  // PlayStation 4
  4,   // iOS
  21,  // Android
  5,   // macOS
  6,   // Linux
  3,   // Xbox One
  8,   // Nintendo 3DS
  9,   // Nintendo DS
  19,  // PS Vita
  41,  // Wii U
  11   // Wii
];

// Función para generar requisitos del sistema aleatorios pero realistas
function generateSystemRequirements() {
  const operatingSystems = ["Windows 10", "Windows 11", "Windows 7/8/10", "Windows 10/11"];
  const processors = [
    "Intel Core i3-4160 / AMD FX-4350", 
    "Intel Core i5-2500K / AMD FX-6300", 
    "Intel Core i5-8400 / AMD Ryzen 3 3300X",
    "Intel Core i7-4770K / AMD Ryzen 5 1500X"
  ];
  const memory = ["4 GB RAM", "8 GB RAM", "12 GB RAM", "16 GB RAM"];
  const graphics = [
    "NVIDIA GTX 660 / AMD Radeon HD 7870", 
    "NVIDIA GTX 1050 / AMD Radeon RX 560", 
    "NVIDIA GTX 1060 / AMD RX 580",
    "NVIDIA RTX 2060 / AMD RX 5700"
  ];
  const storage = ["20 GB", "30 GB", "50 GB", "75 GB", "100 GB"];
  
  // Requisitos recomendados (más exigentes)
  const recProcessors = [
    "Intel Core i5-8600K / AMD Ryzen 5 3600", 
    "Intel Core i7-8700K / AMD Ryzen 7 3700X", 
    "Intel Core i7-10700K / AMD Ryzen 7 5800X",
    "Intel Core i9-9900K / AMD Ryzen 9 3900X"
  ];
  const recMemory = ["8 GB RAM", "16 GB RAM", "32 GB RAM"];
  const recGraphics = [
    "NVIDIA GTX 1060 / AMD Radeon RX 580", 
    "NVIDIA RTX 2060 / AMD Radeon RX 5700", 
    "NVIDIA RTX 2070 / AMD Radeon RX 5700 XT",
    "NVIDIA RTX 3060 / AMD Radeon RX 6600 XT"
  ];
  const recStorage = ["30 GB SSD", "50 GB SSD", "75 GB SSD", "100 GB SSD", "150 GB SSD"];
  
  return {
    minOs: operatingSystems[Math.floor(Math.random() * operatingSystems.length)],
    minProcessor: processors[Math.floor(Math.random() * processors.length)],
    minMemory: memory[Math.floor(Math.random() * memory.length)],
    minGraphics: graphics[Math.floor(Math.random() * graphics.length)],
    minStorage: storage[Math.floor(Math.random() * storage.length)],
    recOs: operatingSystems[Math.floor(Math.random() * operatingSystems.length)],
    recProcessor: recProcessors[Math.floor(Math.random() * recProcessors.length)],
    recMemory: recMemory[Math.floor(Math.random() * recMemory.length)],
    recGraphics: recGraphics[Math.floor(Math.random() * recGraphics.length)],
    recStorage: recStorage[Math.floor(Math.random() * recStorage.length)]
  };
}

// Función para generar precios realistas en pesos chilenos
function generateChileanPrice(rating: number): number {
  // Base price in CLP based on rating
  let basePrice: number;
  
  if (rating >= 4.5) {
    basePrice = 45000 + Math.floor(Math.random() * 5000);
  } else if (rating >= 4) {
    basePrice = 35000 + Math.floor(Math.random() * 10000);
  } else if (rating >= 3.5) {
    basePrice = 25000 + Math.floor(Math.random() * 10000);
  } else if (rating >= 3) {
    basePrice = 15000 + Math.floor(Math.random() * 10000);
  } else {
    basePrice = 5000 + Math.floor(Math.random() * 10000);
  }
  
  // Redondear a miles (común en precios chilenos)
  return Math.round(basePrice / 1000) * 1000;
}

// Función principal para importar juegos por géneros adicionales
async function importMoreGames() {
  console.log('Iniciando importación de juegos adicionales...');
  
  try {
    // Comprobar conexión a la base de datos
    const client = await pool.connect();
    try {
      // Obtener categorías existentes - Modificado para no usar slug que no existe
      const categoriesResult = await client.query('SELECT id, name FROM categories');
      const categories = categoriesResult.rows;
      console.log(`Categorías disponibles: ${categories.length}`);
      
      let totalGamesImported = 0;
      
      // Importar juegos por cada género adicional
      for (const genre of ADDITIONAL_GENRES) {
        console.log(`Importando juegos del género: ${genre}`);
        
        // Buscar si ya existe la categoría por nombre
        let categoryId = categories.find(cat => 
          cat.name.toLowerCase() === genre.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ').toLowerCase()
        )?.id;
        
        // Si no existe, crear la categoría
        if (!categoryId) {
          const categoryName = genre.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          const insertCategoryResult = await client.query(
            'INSERT INTO categories (name) VALUES ($1) RETURNING id',
            [categoryName]
          );
          categoryId = insertCategoryResult.rows[0].id;
          console.log(`Creada nueva categoría: ${categoryName} (ID: ${categoryId})`);
        }
        
        // Obtener juegos de este género
        const gamesPerGenre = await getGamesByGenre(genre, 1, 30, ADDITIONAL_PLATFORMS);
        console.log(`Se encontraron ${gamesPerGenre.length} juegos para el género ${genre}`);
        
        // Procesar cada juego
        for (const rawgGame of gamesPerGenre) {
          try {
            // Verificar si el juego ya existe en la base de datos
            const gameExistsResult = await client.query(
              'SELECT id FROM games WHERE title = $1',
              [rawgGame.name]
            );
            
            if (gameExistsResult.rows.length > 0) {
              console.log(`El juego "${rawgGame.name}" ya existe en la base de datos. Omitiendo.`);
              continue;
            }
            
            // Obtener detalles completos del juego
            const gameDetails = await getGameDetails(rawgGame.id);
            if (!gameDetails) {
              console.log(`No se pudieron obtener detalles para el juego ${rawgGame.name}. Omitiendo.`);
              continue;
            }
            
            // Convertir a nuestro formato
            const gameData = convertRawgGameToOurFormat(gameDetails);
            
            // Generar precio en pesos chilenos
            const gamePrice = generateChileanPrice(gameDetails.rating || 3);
            
            // Generar requisitos del sistema
            const sysReq = generateSystemRequirements();
            
            // Determinar si hay descuento (30% de probabilidad)
            let originalPrice = null;
            let discount = null;
            
            if (Math.random() < 0.3) {
              discount = Math.floor(Math.random() * 40) + 10; // Descuento entre 10% y 50%
              originalPrice = Math.round((gamePrice / (1 - discount/100)) / 1000) * 1000;
            }
            
            // Verificar qué columnas existen en la tabla games
            try {
              // Intentamos ver la estructura de la tabla games
              const tableInfo = await client.query(`
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'games'
              `);
              
              const columns = tableInfo.rows.map(row => row.column_name);
              console.log('Columnas disponibles en la tabla games:', columns);
              
              // Construir la consulta de inserción basada en las columnas existentes
              let columnNames = ['title', 'description', 'price', 'image_url', 'category_id'];
              let placeholders = ['$1', '$2', '$3', '$4', '$5'];
              let values = [
                gameData.title,
                gameData.description,
                gamePrice,
                gameData.image_url,
                categoryId
              ];
              
              let paramIndex = 6;
              
              if (columns.includes('original_price')) {
                columnNames.push('original_price');
                placeholders.push(`$${paramIndex++}`);
                values.push(originalPrice);
              }
              
              if (columns.includes('discount')) {
                columnNames.push('discount');
                placeholders.push(`$${paramIndex++}`);
                values.push(discount);
              }
              
              if (columns.includes('rating')) {
                columnNames.push('rating');
                placeholders.push(`$${paramIndex++}`);
                values.push(gameDetails.rating || 0);
              }
              
              if (columns.includes('release_date')) {
                columnNames.push('release_date');
                placeholders.push(`$${paramIndex++}`);
                values.push(gameDetails.released || new Date().toISOString().split('T')[0]);
              }
              
              // Requisitos mínimos
              if (columns.includes('min_os')) {
                columnNames.push('min_os');
                placeholders.push(`$${paramIndex++}`);
                values.push(sysReq.minOs);
              }
              
              if (columns.includes('min_processor')) {
                columnNames.push('min_processor');
                placeholders.push(`$${paramIndex++}`);
                values.push(sysReq.minProcessor);
              }
              
              if (columns.includes('min_memory')) {
                columnNames.push('min_memory');
                placeholders.push(`$${paramIndex++}`);
                values.push(sysReq.minMemory);
              }
              
              if (columns.includes('min_graphics')) {
                columnNames.push('min_graphics');
                placeholders.push(`$${paramIndex++}`);
                values.push(sysReq.minGraphics);
              }
              
              if (columns.includes('min_storage')) {
                columnNames.push('min_storage');
                placeholders.push(`$${paramIndex++}`);
                values.push(sysReq.minStorage);
              }
              
              // Requisitos recomendados
              if (columns.includes('rec_os')) {
                columnNames.push('rec_os');
                placeholders.push(`$${paramIndex++}`);
                values.push(sysReq.recOs);
              }
              
              if (columns.includes('rec_processor')) {
                columnNames.push('rec_processor');
                placeholders.push(`$${paramIndex++}`);
                values.push(sysReq.recProcessor);
              }
              
              if (columns.includes('rec_memory')) {
                columnNames.push('rec_memory');
                placeholders.push(`$${paramIndex++}`);
                values.push(sysReq.recMemory);
              }
              
              if (columns.includes('rec_graphics')) {
                columnNames.push('rec_graphics');
                placeholders.push(`$${paramIndex++}`);
                values.push(sysReq.recGraphics);
              }
              
              if (columns.includes('rec_storage')) {
                columnNames.push('rec_storage');
                placeholders.push(`$${paramIndex++}`);
                values.push(sysReq.recStorage);
              }
              
              // Construir la consulta SQL
              const query = `
                INSERT INTO games (${columnNames.join(', ')})
                VALUES (${placeholders.join(', ')})
                RETURNING id
              `;
              
              // Ejecutar la consulta
              const result = await client.query(query, values);
              
              console.log(`Juego "${gameData.title}" importado correctamente (ID: ${result.rows[0].id})`);
              totalGamesImported++;
            } catch (schemaError) {
              console.error('Error al obtener información de la tabla games:', schemaError);
              throw schemaError;
            }
          } catch (gameError) {
            console.error(`Error al procesar el juego ${rawgGame.name}:`, gameError);
          }
        }
      }
      
      console.log(`Importación completada. Total de juegos importados: ${totalGamesImported}`);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error durante la importación:', error);
  } finally {
    // Cerrar la conexión a la base de datos
    await pool.end();
    console.log('Conexión a la base de datos cerrada.');
  }
}

// Ejecutar la función principal
importMoreGames().catch(err => {
  console.error('Error en la función principal:', err);
  process.exit(1);
}); 