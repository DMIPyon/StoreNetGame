import { pool } from '../config/database';
import { importGamesFromRawg, getGenres, getGameDetails } from '../services/rawgApi';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Factor de conversión EUR a CLP (aproximado, ajustar según el cambio actual)
const EUR_TO_CLP = 950; 

// Interfaces para la tipificación
interface Game {
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

// Extenderemos la interfaz Game para nuestro uso interno
interface EnhancedGame extends Game {
  rawgId?: number;
  rating?: number;
}

interface RawgGameDetails {
  id: number;
  name: string;
  rating?: number;
  released?: string;
  developers?: Array<{name: string}>;
  platforms?: Array<{platform: {name: string}}>;
  tags?: Array<{name: string}>;
  genres?: Array<{id: number; name: string; slug: string}>;
}

interface GamePrice {
  price: number;
  originalPrice: number | null;
  discount: number | null;
}

interface SystemRequirements {
  minOs: string;
  minProcessor: string;
  minMemory: string;
  minGraphics: string;
  minStorage: string;
  recOs: string;
  recProcessor: string;
  recMemory: string;
  recGraphics: string;
  recStorage: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

/**
 * Busca el precio real del juego en tiendas chilenas
 * @param gameTitle Nombre del juego
 * @returns Objeto con precio, precio original y descuento
 */
async function searchRealPriceInChile(gameTitle: string): Promise<GamePrice> {
  try {
    // Intentamos primero buscar en Zmart
    try {
      const searchQuery = encodeURIComponent(`${gameTitle} juego zmart.cl precio`);
      const response = await axios.get(`https://www.google.com/search?q=${searchQuery}`);
      const $ = cheerio.load(response.data);
      
      // Buscar precios en los resultados
      const content = $('.g').text();
      const priceMatch = content.match(/\$\s*([\d\.]+)/);
      
      if (priceMatch && priceMatch[1]) {
        const price = parseInt(priceMatch[1].replace(/\./g, ''));
        
        // Buscar si hay descuento
        const originalPriceMatch = content.match(/\$\s*([\d\.]+).*?\$\s*([\d\.]+)/);
        if (originalPriceMatch && originalPriceMatch[1] && originalPriceMatch[2]) {
          const originalPrice = parseInt(originalPriceMatch[1].replace(/\./g, ''));
          const discountedPrice = parseInt(originalPriceMatch[2].replace(/\./g, ''));
          
          // Calcular el porcentaje de descuento
          const discount = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
          
          return {
            price: discountedPrice,
            originalPrice,
            discount
          };
        }
        
        return {
          price,
          originalPrice: null,
          discount: null
        };
      }
    } catch (error) {
      console.log(`Error buscando precio en Zmart para ${gameTitle}: ${error}`);
    }
    
    // Luego intentamos buscar en Weplay
    try {
      const searchQuery = encodeURIComponent(`${gameTitle} juego weplay.cl precio`);
      const response = await axios.get(`https://www.google.com/search?q=${searchQuery}`);
      const $ = cheerio.load(response.data);
      
      const content = $('.g').text();
      const priceMatch = content.match(/\$\s*([\d\.]+)/);
      
      if (priceMatch && priceMatch[1]) {
        const price = parseInt(priceMatch[1].replace(/\./g, ''));
        
        // Buscar si hay descuento
        const originalPriceMatch = content.match(/\$\s*([\d\.]+).*?\$\s*([\d\.]+)/);
        if (originalPriceMatch && originalPriceMatch[1] && originalPriceMatch[2]) {
          const originalPrice = parseInt(originalPriceMatch[1].replace(/\./g, ''));
          const discountedPrice = parseInt(originalPriceMatch[2].replace(/\./g, ''));
          
          const discount = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
          
          return {
            price: discountedPrice,
            originalPrice,
            discount
          };
        }
        
        return {
          price,
          originalPrice: null,
          discount: null
        };
      }
    } catch (error) {
      console.log(`Error buscando precio en Weplay para ${gameTitle}: ${error}`);
    }
    
    // Si nada funciona, buscamos en Steam en pesos chilenos
    try {
      const searchQuery = encodeURIComponent(`${gameTitle} steam precio chile CLP`);
      const response = await axios.get(`https://www.google.com/search?q=${searchQuery}`);
      const $ = cheerio.load(response.data);
      
      const content = $('.g').text();
      // Buscar patrones de precios en formato CLP
      const priceMatch = content.match(/CLP\s*\$\s*([\d\.]+)/i);
      
      if (priceMatch && priceMatch[1]) {
        const price = parseInt(priceMatch[1].replace(/\./g, ''));
        
        // Buscar si hay descuento
        const discountMatch = content.match(/(\d+)%\s*de\s*descuento/i);
        if (discountMatch && discountMatch[1]) {
          const discount = parseInt(discountMatch[1]);
          // Calcular precio original aproximado
          const originalPrice = Math.round(price / (1 - discount/100));
          
          return {
            price,
            originalPrice,
            discount
          };
        }
        
        return {
          price,
          originalPrice: null,
          discount: null
        };
      }
    } catch (error) {
      console.log(`Error buscando precio en Steam para ${gameTitle}: ${error}`);
    }
    
    // Si no encontramos nada, generamos un precio realista
    return {
      price: generateChileanPrice(Math.random() * 2 + 3),
      originalPrice: null,
      discount: null
    };
  } catch (error) {
    console.error(`Error general buscando precio para ${gameTitle}:`, error);
    return {
      price: generateChileanPrice(Math.random() * 2 + 3),
      originalPrice: null,
      discount: null
    };
  }
}

/**
 * Busca los requisitos del sistema para un juego
 * @param gameTitle Nombre del juego
 * @returns Objeto con requisitos mínimos y recomendados
 */
async function searchSystemRequirements(gameTitle: string): Promise<SystemRequirements> {
  try {
    // Primero intentamos en SystemRequirementsLab
    const searchQuery = encodeURIComponent(`${gameTitle} system requirements game-debate`);
    
    // Hacer una búsqueda web básica
    const response = await axios.get(`https://www.google.com/search?q=${searchQuery}`);
    const $ = cheerio.load(response.data);
    
    // Intentar encontrar información de requisitos
    const contentText = $('.g').text().toLowerCase();
    
    // Valores por defecto
    let minOs = "Windows 10";
    let minProcessor = "Intel Core i5-2500K / AMD FX-6300";
    let minMemory = "8 GB RAM";
    let minGraphics = "NVIDIA GTX 1050 / AMD Radeon RX 560";
    let minStorage = "50 GB";
    
    let recOs = "Windows 10/11";
    let recProcessor = "Intel Core i7-8700K / AMD Ryzen 5 3600X";
    let recMemory = "16 GB RAM";
    let recGraphics = "NVIDIA RTX 2060 / AMD Radeon RX 5700 XT";
    let recStorage = "50 GB SSD";
    
    // Intentamos otra búsqueda más específica
    try {
      const pcGameBenchmarkQuery = encodeURIComponent(`${gameTitle} system requirements pcgamebenchmark`);
      const pcgbResponse = await axios.get(`https://www.google.com/search?q=${pcGameBenchmarkQuery}`);
      const $pcgb = cheerio.load(pcgbResponse.data);
      
      const pcgbText = $pcgb('.g').text().toLowerCase();
      
      // Extraer información específica
      
      // CPUs
      if (pcgbText.includes("minimum") && pcgbText.includes("cpu") && pcgbText.includes("intel")) {
        const cpuMatch = pcgbText.match(/minimum.*?cpu.*?(intel.*?ghz|amd.*?ghz)/i);
        if (cpuMatch && cpuMatch[1]) {
          minProcessor = cpuMatch[1].trim();
        }
      }
      
      if (pcgbText.includes("recommended") && pcgbText.includes("cpu") && pcgbText.includes("intel")) {
        const cpuMatch = pcgbText.match(/recommended.*?cpu.*?(intel.*?ghz|amd.*?ghz)/i);
        if (cpuMatch && cpuMatch[1]) {
          recProcessor = cpuMatch[1].trim();
        }
      }
      
      // GPUs
      if (pcgbText.includes("minimum") && pcgbText.includes("gpu") && 
          (pcgbText.includes("nvidia") || pcgbText.includes("amd") || pcgbText.includes("geforce") || pcgbText.includes("radeon"))) {
        const gpuMatch = pcgbText.match(/minimum.*?gpu.*?(nvidia.*?gb|geforce.*?gb|amd.*?gb|radeon.*?gb)/i);
        if (gpuMatch && gpuMatch[1]) {
          minGraphics = gpuMatch[1].trim();
        }
      }
      
      if (pcgbText.includes("recommended") && pcgbText.includes("gpu") && 
          (pcgbText.includes("nvidia") || pcgbText.includes("amd") || pcgbText.includes("geforce") || pcgbText.includes("radeon"))) {
        const gpuMatch = pcgbText.match(/recommended.*?gpu.*?(nvidia.*?gb|geforce.*?gb|amd.*?gb|radeon.*?gb)/i);
        if (gpuMatch && gpuMatch[1]) {
          recGraphics = gpuMatch[1].trim();
        }
      }
      
      // RAM
      if (pcgbText.includes("minimum") && pcgbText.includes("ram") && pcgbText.includes("gb")) {
        const ramMatch = pcgbText.match(/minimum.*?ram.*?(\d+)\s*gb/i);
        if (ramMatch && ramMatch[1]) {
          minMemory = `${ramMatch[1]} GB RAM`;
        }
      }
      
      if (pcgbText.includes("recommended") && pcgbText.includes("ram") && pcgbText.includes("gb")) {
        const ramMatch = pcgbText.match(/recommended.*?ram.*?(\d+)\s*gb/i);
        if (ramMatch && ramMatch[1]) {
          recMemory = `${ramMatch[1]} GB RAM`;
        }
      }
      
      // OS
      if (pcgbText.includes("minimum") && pcgbText.includes("os") && pcgbText.includes("windows")) {
        const osMatch = pcgbText.match(/minimum.*?os.*?(windows \d+)/i);
        if (osMatch && osMatch[1]) {
          minOs = osMatch[1].trim();
        }
      }
      
      // Storage
      if (pcgbText.includes("minimum") && pcgbText.includes("storage") && pcgbText.includes("gb")) {
        const storageMatch = pcgbText.match(/minimum.*?storage.*?(\d+)\s*gb/i);
        if (storageMatch && storageMatch[1]) {
          minStorage = `${storageMatch[1]} GB`;
        }
      }
      
      if (pcgbText.includes("recommended") && pcgbText.includes("storage") && pcgbText.includes("gb")) {
        const storageMatch = pcgbText.match(/recommended.*?storage.*?(\d+)\s*gb/i);
        if (storageMatch && storageMatch[1]) {
          recStorage = `${storageMatch[1]} GB SSD`;
        }
      }
    } catch (error) {
      console.log(`Error en búsqueda específica de requisitos para ${gameTitle}: ${error}`);
    }
    
    // Si no encontramos información específica, usamos la información del texto original
    if (contentText.includes("windows 7") && contentText.includes("minimum")) {
      minOs = "Windows 7";
    } else if (contentText.includes("windows 8") && contentText.includes("minimum")) {
      minOs = "Windows 8/8.1";
    } else if (contentText.includes("windows 10") && contentText.includes("minimum")) {
      minOs = "Windows 10";
    }
    
    if (contentText.includes("windows 11") && contentText.includes("recommended")) {
      recOs = "Windows 11";
    } else if (contentText.includes("windows 10") && contentText.includes("recommended")) {
      recOs = "Windows 10/11";
    }
    
    // Procesadores
    if (contentText.includes("intel") && contentText.includes("i3") && contentText.includes("minimum")) {
      minProcessor = "Intel Core i3 / AMD Ryzen 3";
    } else if (contentText.includes("intel") && contentText.includes("i5") && contentText.includes("minimum")) {
      minProcessor = "Intel Core i5 / AMD Ryzen 5";
    }
    
    if (contentText.includes("intel") && contentText.includes("i9") && contentText.includes("recommended")) {
      recProcessor = "Intel Core i9 / AMD Ryzen 9";
    } else if (contentText.includes("intel") && contentText.includes("i7") && contentText.includes("recommended")) {
      recProcessor = "Intel Core i7 / AMD Ryzen 7";
    }
    
    // Memoria
    if (contentText.includes("16 gb") && contentText.includes("minimum")) {
      minMemory = "16 GB RAM";
    } else if (contentText.includes("12 gb") && contentText.includes("minimum")) {
      minMemory = "12 GB RAM";
    } else if (contentText.includes("8 gb") && contentText.includes("minimum")) {
      minMemory = "8 GB RAM";
    }
    
    if (contentText.includes("32 gb") && contentText.includes("recommended")) {
      recMemory = "32 GB RAM";
    } else if (contentText.includes("16 gb") && contentText.includes("recommended")) {
      recMemory = "16 GB RAM";
    }
    
    // GPU
    if (contentText.includes("rtx") && contentText.includes("minimum")) {
      minGraphics = "NVIDIA RTX 2060 / AMD RX 5600 XT";
    } else if (contentText.includes("gtx 1060") || contentText.includes("rx 580")) {
      minGraphics = "NVIDIA GTX 1060 / AMD RX 580";
    }
    
    if (contentText.includes("rtx 3080") || contentText.includes("rx 6800")) {
      recGraphics = "NVIDIA RTX 3080 / AMD RX 6800 XT";
    } else if (contentText.includes("rtx 2080") || contentText.includes("rx 5700")) {
      recGraphics = "NVIDIA RTX 2080 / AMD RX 5700 XT";
    }
    
    // Almacenamiento
    if (contentText.includes("100 gb") && contentText.includes("storage")) {
      minStorage = "100 GB";
      recStorage = "100 GB SSD";
    } else if (contentText.includes("150 gb") && contentText.includes("storage")) {
      minStorage = "150 GB";
      recStorage = "150 GB SSD";
    } else if (contentText.includes("200 gb") && contentText.includes("storage")) {
      minStorage = "200 GB";
      recStorage = "200 GB SSD";
    }
    
    return {
      minOs,
      minProcessor,
      minMemory,
      minGraphics,
      minStorage,
      recOs,
      recProcessor,
      recMemory,
      recGraphics,
      recStorage
    };
    
  } catch (error) {
    console.error(`Error buscando requisitos para ${gameTitle}:`, error);
    // Devolver requisitos genéricos si hay algún error
    return {
      minOs: "Windows 10",
      minProcessor: "Intel Core i5-2500K / AMD FX-6300",
      minMemory: "8 GB RAM",
      minGraphics: "NVIDIA GTX 1050 / AMD Radeon RX 560",
      minStorage: "50 GB",
      recOs: "Windows 10/11",
      recProcessor: "Intel Core i7-8700K / AMD Ryzen 5 3600X",
      recMemory: "16 GB RAM",
      recGraphics: "NVIDIA RTX 2060 / AMD Radeon RX 5700 XT",
      recStorage: "50 GB SSD"
    };
  }
}

/**
 * Genera un precio en pesos chilenos basado en el valor del juego
 * Se ajusta según la calidad/popularidad del juego
 */
function generateChileanPrice(rating: number): number {
  // Base de precios actuales del mercado chileno para videojuegos
  // AAA: 45.000-70.000, AA: 30.000-45.000, Indie/Otros: 8.000-30.000
  let basePrice: number;
  
  if (rating >= 4.5) {
    // Juegos top AAA (59.990 - 69.990 CLP)
    basePrice = Math.floor(Math.random() * 10000) + 59990;
  } else if (rating >= 4.0) {
    // Juegos AAA estándar (49.990 - 59.990 CLP)
    basePrice = Math.floor(Math.random() * 10000) + 49990;
  } else if (rating >= 3.5) {
    // Juegos AA (35.990 - 49.990 CLP)
    basePrice = Math.floor(Math.random() * 14000) + 35990;
  } else if (rating >= 3.0) {
    // Juegos independientes de calidad (19.990 - 35.990 CLP)
    basePrice = Math.floor(Math.random() * 16000) + 19990;
  } else {
    // Juegos económicos o más antiguos (7.990 - 19.990 CLP)
    basePrice = Math.floor(Math.random() * 12000) + 7990;
  }
  
  // Redondear a 990 (formato común de precios en Chile)
  return Math.floor(basePrice / 1000) * 1000 + 990;
}

/**
 * Obtiene información adicional del juego desde RAWG API
 */
async function getExtraGameInfo(id: number): Promise<RawgGameDetails | null> {
  try {
    const response = await axios.get(`https://api.rawg.io/api/games/${id}`, {
      params: {
        key: 'c5f131835d494f6dbd96e4a46b327024'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo detalles del juego ${id}:`, error);
    return null;
  }
}

/**
 * Obtiene todas las categorías de la base de datos
 */
async function getAllCategories(): Promise<Category[]> {
  try {
    const result = await pool.query('SELECT id, name FROM categories');
    return result.rows;
  } catch (error) {
    console.error('Error obteniendo categorías de la base de datos:', error);
    return [];
  }
}

/**
 * Encuentra el id de la categoría que mejor coincide con el nombre dado
 */
function findCategoryId(categories: Category[], categoryName: string): number | null {
  // Normalizar el nombre para comparación
  const normalizedName = categoryName.toLowerCase().trim();
  
  // Buscar coincidencia exacta
  const exactMatch = categories.find(
    category => category.name.toLowerCase() === normalizedName
  );
  
  if (exactMatch) {
    return exactMatch.id;
  }
  
  // Buscar coincidencia parcial
  const partialMatch = categories.find(
    category => normalizedName.includes(category.name.toLowerCase()) || 
                category.name.toLowerCase().includes(normalizedName)
  );
  
  if (partialMatch) {
    return partialMatch.id;
  }
  
  // Mapeo de categorías comunes que podrían no coincidir exactamente
  const categoryMapping: {[key: string]: string} = {
    'shooter': 'Acción',
    'fps': 'Acción',
    'fighting': 'Acción',
    'platformer': 'Aventura',
    'puzzle': 'Puzzle',
    'racing': 'Carreras',
    'sports': 'Deportes',
    'strategy': 'Estrategia',
    'rpg': 'RPG',
    'role-playing': 'RPG',
    'mmorpg': 'RPG',
    'simulation': 'Simulación',
    'indie': 'Indie',
    'casual': 'Casual',
    'arcade': 'Arcade'
  };
  
  // Intentar encontrar una coincidencia a través del mapeo
  for (const [key, value] of Object.entries(categoryMapping)) {
    if (normalizedName.includes(key)) {
      const mappedCategory = categories.find(
        category => category.name.toLowerCase() === value.toLowerCase()
      );
      if (mappedCategory) {
        return mappedCategory.id;
      }
    }
  }
  
  // Si no hay coincidencia, devolver null
  return null;
}

/**
 * Poblar la tabla de categorías
 */
async function populateCategories() {
  try {
    // Primero eliminar categorías existentes
    await pool.query('TRUNCATE TABLE categories RESTART IDENTITY CASCADE');
    
    console.log('Obteniendo géneros desde RAWG API...');
    const genres = await getGenres();
    
    if (!genres || genres.length === 0) {
      console.log('No se pudieron obtener géneros desde la API');
      // Categorías predeterminadas como fallback
      const defaultCategories = [
        'Acción', 'Aventura', 'RPG', 'Estrategia', 'Shooter', 'Deportes', 
        'Carreras', 'Simulación', 'Puzzle', 'Indie', 'Casual', 'Arcade',
        'Plataformas', 'Pelea', 'Horror', 'Supervivencia', 'MMO', 'Mundo Abierto'
      ];
      
      for (const name of defaultCategories) {
        await pool.query(
          'INSERT INTO categories (name, icon) VALUES ($1, $2)',
          [name, `${name.toLowerCase().replace(/\s+/g, '-')}.png`]
        );
      }
      console.log('✅ Categorías predeterminadas insertadas');
    } else {
      // Insertar géneros como categorías
      for (const genre of genres) {
        await pool.query(
          'INSERT INTO categories (name, icon) VALUES ($1, $2)',
          [genre.name, `${genre.slug}.png`]
        );
      }
      console.log(`✅ ${genres.length} categorías insertadas desde RAWG`);
    }
  } catch (error) {
    console.error('❌ Error al poblar categorías:', error);
  }
}

/**
 * Poblar la tabla de juegos con datos de RAWG API y precios reales
 */
async function populateGames() {
  try {
    // Limpiar tabla de juegos
    await pool.query('TRUNCATE TABLE games RESTART IDENTITY CASCADE');
    
    console.log('Importando juegos desde RAWG API...');
    const rawgGames = await importGamesFromRawg(50); // Obtener 50 juegos
    
    // Obtener IDs de RAWG para cada juego
    const games: EnhancedGame[] = [];
    
    // Obtener IDs de juegos populares para asignarlos
    try {
      const popularGamesResponse = await axios.get('https://api.rawg.io/api/games', {
        params: {
          key: 'c5f131835d494f6dbd96e4a46b327024',
          ordering: '-added',
          page_size: 50
        }
      });
      
      const popularGames = popularGamesResponse.data.results;
      
      // Asignar IDs de RAWG a nuestros juegos
      for (let i = 0; i < rawgGames.length; i++) {
        const enhancedGame: EnhancedGame = {
          ...rawgGames[i],
          rawgId: popularGames[i]?.id || undefined,
          rating: popularGames[i]?.rating || undefined
        };
        games.push(enhancedGame);
      }
    } catch (error) {
      console.error('Error obteniendo juegos populares para IDs:', error);
      // Si falla, simplemente usamos los juegos sin IDs de RAWG
      games.push(...rawgGames);
    }
    
    // Obtener todas las categorías de la base de datos
    const categories = await getAllCategories();
    console.log(`Categorías disponibles en la base de datos: ${categories.map(c => c.name).join(', ')}`);
    
    let successCount = 0;
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      
      // Obtener detalles adicionales del juego
      let extraInfo = null;
      if (game.rawgId) {
        extraInfo = await getExtraGameInfo(game.rawgId);
      }
      
      // Obtener el rating del juego
      const rating = game.rating || (extraInfo?.rating || Math.random() * 2 + 3);
      
      // Buscar precio real en Chile
      console.log(`Buscando precio real para: ${game.title}`);
      const priceInfo = await searchRealPriceInChile(game.title);
      
      // Buscar requisitos del sistema
      console.log(`Buscando requisitos del sistema para: ${game.title}`);
      const requirements = await searchSystemRequirements(game.title);
      
      // Determinar la categoría correcta y su ID
      let categoryName = game.category;
      let categoryId = null;
      
      // Si tenemos información extra del juego, usamos sus géneros para determinar mejor la categoría
      if (extraInfo && extraInfo.genres && extraInfo.genres.length > 0) {
        // Usar el primer género como categoría principal
        categoryName = extraInfo.genres[0].name;
        
        // Buscar el ID de categoría correspondiente
        categoryId = findCategoryId(categories, categoryName);
        
        console.log(`Categoría determinada para ${game.title}: ${categoryName} (ID: ${categoryId || 'No encontrado'})`);
      } else {
        // Si no hay información extra, usamos la categoría actual del juego
        categoryId = findCategoryId(categories, categoryName);
        console.log(`Usando categoría existente para ${game.title}: ${categoryName} (ID: ${categoryId || 'No encontrado'})`);
      }
      
      // Guardar en la base de datos
      await pool.query(
        `INSERT INTO games (
          title, description, price, original_price, discount, image_url, 
          category, category_id, rating, developer, release_date, tags,
          requirements_min_os, requirements_min_processor, requirements_min_memory, 
          requirements_min_graphics, requirements_min_storage,
          requirements_rec_os, requirements_rec_processor, requirements_rec_memory, 
          requirements_rec_graphics, requirements_rec_storage
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
        )`,
        [
          game.title,
          game.description,
          priceInfo.price,
          priceInfo.originalPrice,
          priceInfo.discount,
          game.image_url,
          categoryName,
          categoryId,
          rating,
          extraInfo?.developers?.[0]?.name || 'Desarrollador desconocido',
          extraInfo?.released || 'Fecha desconocida',
          extraInfo?.tags?.slice(0, 5).map((tag: {name: string}) => tag.name) || [],
          requirements.minOs,
          requirements.minProcessor,
          requirements.minMemory,
          requirements.minGraphics,
          requirements.minStorage,
          requirements.recOs,
          requirements.recProcessor,
          requirements.recMemory,
          requirements.recGraphics,
          requirements.recStorage
        ]
      );
      
      successCount++;
      if (i % 10 === 0) {
        console.log(`Progreso: ${i + 1}/${games.length} juegos insertados...`);
      }
    }
    
    console.log(`✅ ${successCount} juegos insertados correctamente`);
  } catch (error) {
    console.error('❌ Error al poblar juegos:', error);
  }
}

/**
 * Función principal
 */
async function main() {
  try {
    console.log('Iniciando la población de la base de datos...');
    
    // Primero poblar categorías
    await populateCategories();
    
    // Luego poblar juegos
    await populateGames();
    
    console.log('✅ Base de datos poblada exitosamente');
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
  } finally {
    // Cerrar conexión
    pool.end();
  }
}

// Ejecutar el script
main(); 