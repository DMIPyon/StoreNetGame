import { pool } from '../config/database';
import axios from 'axios';
import * as rawgApi from '../services/rawgApi';
import dotenv from 'dotenv';

dotenv.config();

// API key de RAWG
const RAWG_API_KEY = process.env.RAWG_API_KEY || 'c5f131835d494f6dbd96e4a46b327024';
const BASE_URL = 'https://api.rawg.io/api';

// Géneros populares para importar (ampliado)
const GENRES = [
  'action',
  'adventure',
  'rpg',
  'strategy',
  'shooter',
  'puzzle',
  'racing',
  'sports',
  'simulation',
  'arcade',
  'platformer',
  'fighting',
  'family',
  'board-games',
  'educational',
  'card',
  'casual',
  'indie',
  'massively-multiplayer',
  'horror'
];

// Plataformas a considerar
const PLATFORMS = [1, 4, 5, 18, 186, 187]; // PC, PS4, PS5, Xbox One, Xbox Series S/X, Nintendo Switch

/**
 * Genera un precio en pesos chilenos basado en la calificación y fecha de lanzamiento
 */
function generatePrice(rating: number, releaseDate: string | undefined): {price: number, discount: number | null, originalPrice: number | null} {
  // Determinar si es un juego reciente (menos de 1.5 años)
  const isRecent = releaseDate ? (new Date().getTime() - new Date(releaseDate).getTime()) < 547 * 24 * 60 * 60 * 1000 : false;
  
  // Base de precios actuales del mercado chileno para videojuegos
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
  basePrice = Math.floor(basePrice / 1000) * 1000 + 990;
  
  // Aplicar descuento a algunos juegos (30% de probabilidad)
  const shouldDiscount = Math.random() < 0.3;
  
  if (shouldDiscount && !isRecent) {
    // Los juegos recientes rara vez tienen descuentos grandes
    const discountPercentage = Math.floor(Math.random() * 4) * 10 + 10; // 10%, 20%, 30% o 40%
    const discountedPrice = Math.round(basePrice * (1 - discountPercentage/100) / 100) * 100 + 90;
    return {
      price: discountedPrice,
      discount: discountPercentage,
      originalPrice: basePrice
    };
  }
  
  return {
    price: basePrice,
    discount: null,
    originalPrice: null
  };
}

/**
 * Mapea los géneros de RAWG a nuestras categorías
 */
async function mapGenresToCategories(genres: any[]): Promise<{name: string, id: number | null}> {
  // Si no hay géneros, asignar categoría predeterminada
  if (!genres || genres.length === 0) {
    return { name: 'Otros', id: null };
  }

  try {
    // Obtener todas las categorías de la base de datos
    const categoriesResult = await pool.query('SELECT id, name FROM categories');
    const categories = categoriesResult.rows;
    
    // Intentar mapear el primer género a nuestras categorías
    for (const genre of genres) {
      // Buscar coincidencia exacta por nombre
      const match = categories.find(cat => 
        cat.name.toLowerCase() === genre.name.toLowerCase()
      );
      
      if (match) {
        return { name: genre.name, id: match.id };
      }
    }
    
    // Si no hay coincidencia exacta, usar el primer género sin ID
    return { name: genres[0].name, id: null };
    
  } catch (error) {
    console.error('Error al mapear géneros a categorías:', error);
    return { name: genres[0]?.name || 'Otros', id: null };
  }
}

/**
 * Obtiene detalles completos del juego desde RAWG
 */
async function getFullGameDetails(gameId: number): Promise<any> {
  try {
    const response = await axios.get(`${BASE_URL}/games/${gameId}`, {
      params: { key: RAWG_API_KEY }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo detalles del juego ${gameId}:`, error);
    return null;
  }
}

/**
 * Genera una descripción mejorada para el juego
 */
function generateEnhancedDescription(baseDescription: string, gameDetails: any): string {
  // Si no hay descripción base, generar una predeterminada
  if (!baseDescription || baseDescription.trim() === '' || baseDescription === 'Sin descripción disponible.') {
    baseDescription = 'Este juego ofrece una experiencia única para los jugadores.';
  }
  
  // Agregar información sobre géneros
  let enhancedDesc = baseDescription + '\n\n';
  
  // Información sobre géneros
  if (gameDetails.genres && gameDetails.genres.length > 0) {
    enhancedDesc += `Géneros: ${gameDetails.genres.map((g: any) => g.name).join(', ')}.\n\n`;
  }
  
  // Plataformas disponibles
  if (gameDetails.platforms && gameDetails.platforms.length > 0) {
    const platformNames = gameDetails.platforms.map((p: any) => p.platform.name);
    enhancedDesc += `Disponible en: ${platformNames.join(', ')}.\n\n`;
  }
  
  // Desarrollador
  if (gameDetails.developers && gameDetails.developers.length > 0) {
    enhancedDesc += `Desarrollado por ${gameDetails.developers[0].name}`;
    if (gameDetails.publishers && gameDetails.publishers.length > 0) {
      enhancedDesc += ` y publicado por ${gameDetails.publishers[0].name}`;
    }
    enhancedDesc += '.\n\n';
  }
  
  // Añadir información sobre la crítica si está disponible
  if (gameDetails.ratings && gameDetails.ratings.length > 0) {
    const topRating = gameDetails.ratings[0];
    enhancedDesc += `Los críticos consideran que este juego es "${topRating.title}" con un ${Math.round(topRating.percent)}% de aprobación.\n\n`;
  }
  
  // Información sobre el ESRB si está disponible
  if (gameDetails.esrb_rating) {
    enhancedDesc += `Clasificación: ${gameDetails.esrb_rating.name}.\n\n`;
  }
  
  // Agregar información sobre tags si están disponibles
  if (gameDetails.tags && gameDetails.tags.length > 0) {
    const tags = gameDetails.tags.slice(0, 5).map((tag: any) => tag.name);
    enhancedDesc += `Etiquetas populares: ${tags.join(', ')}.\n\n`;
  }
  
  // Agregar una recomendación ficticia
  const recommendationPhrases = [
    'Altamente recomendado para los fans del género.',
    'Una experiencia que no te puedes perder si disfrutas los juegos de acción.',
    'Perfecto para jugadores que buscan un desafío.',
    'Ideal para sesiones de juego casuales o intensas.',
    'Una gran adición a tu biblioteca de juegos.',
    'Un título imprescindible para los verdaderos gamers.',
    'Una aventura que te mantendrá enganchado durante horas.'
  ];
  
  enhancedDesc += recommendationPhrases[Math.floor(Math.random() * recommendationPhrases.length)];
  
  return enhancedDesc;
}

/**
 * Importa juegos por género especificado
 */
async function importGamesByGenre(genre: string, gamesPerGenre: number): Promise<number> {
  console.log(`\nImportando hasta ${gamesPerGenre} juegos del género: ${genre}`);
  
  try {
    let gamesImported = 0;
    let page = 1;
    
    // Seguir importando hasta alcanzar el límite por género
    while (gamesImported < gamesPerGenre) {
      // Obtener juegos por género
      const response = await axios.get(`${BASE_URL}/games`, {
        params: {
          key: RAWG_API_KEY,
          genres: genre,
          page,
          page_size: 40, // Solicitar más juegos por página
          ordering: '-added', // Ordenar por más populares primero
          platforms: PLATFORMS.join(',')
        }
      });
      
      const games = response.data.results;
      
      // Si no hay más juegos, salir del bucle
      if (!games || games.length === 0) {
        break;
      }
      
      // Procesar cada juego
      for (const game of games) {
        // Verificar si el juego ya existe
        const existingGame = await pool.query(
          'SELECT id FROM games WHERE title = $1',
          [game.name]
        );
        
        if (existingGame.rows.length > 0) {
          console.log(`  - Juego "${game.name}" ya existe en la base de datos.`);
          continue;
        }
        
        // Obtener detalles completos para enriquecer la información
        const details = await getFullGameDetails(game.id);
        
        if (!details) {
          console.log(`  - No se pudieron obtener detalles para "${game.name}"`);
          continue;
        }
        
        // Generar slug único para el juego
        const slug = details.slug || game.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        // Mapear géneros a nuestras categorías
        const category = await mapGenresToCategories(details.genres || game.genres);
        
        // Generar precio realista
        const priceInfo = generatePrice(details.rating || game.rating || 3.5, details.released);
        
        // Generar descripción mejorada
        const enhancedDescription = generateEnhancedDescription(details.description_raw || 'Sin descripción disponible.', details);
        
        // Determinar si es destacado (10% de probabilidad)
        const isFeatured = Math.random() < 0.1;
        
        // Formar los datos del juego
        const gameData = {
          title: details.name,
          description: enhancedDescription,
          price: priceInfo.price,
          original_price: priceInfo.originalPrice,
          discount: priceInfo.discount,
          image_url: details.background_image || game.background_image,
          category: category.name,
          category_id: category.id,
          rating: details.rating || game.rating || 3.5,
          developer: details.developers?.length > 0 ? details.developers[0].name : 'Desconocido',
          release_date: details.released || 'Desconocido',
          tags: details.tags?.slice(0, 5).map((tag: any) => tag.name) || [],
          requirements_min_os: "Windows 10",
          requirements_min_processor: "Intel Core i5-2500K / AMD FX-6300",
          requirements_min_memory: "8 GB RAM",
          requirements_min_graphics: "NVIDIA GTX 1050 / AMD Radeon RX 560",
          requirements_min_storage: "50 GB",
          requirements_rec_os: "Windows 10/11",
          requirements_rec_processor: "Intel Core i7-8700K / AMD Ryzen 5 3600X",
          requirements_rec_memory: "16 GB RAM",
          requirements_rec_graphics: "NVIDIA RTX 2060 / AMD Radeon RX 5700 XT",
          requirements_rec_storage: "50 GB SSD"
        };
        
        // Insertar juego en la base de datos
        await pool.query(`
          INSERT INTO games (
            title, description, price, original_price, discount, image_url, 
            category, category_id, rating, developer, release_date, tags,
            requirements_min_os, requirements_min_processor, requirements_min_memory, 
            requirements_min_graphics, requirements_min_storage,
            requirements_rec_os, requirements_rec_processor, requirements_rec_memory, 
            requirements_rec_graphics, requirements_rec_storage
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 
            $18, $19, $20, $21, $22
          )`,
          [
            gameData.title, gameData.description, gameData.price, gameData.original_price,
            gameData.discount, gameData.image_url, gameData.category, gameData.category_id,
            gameData.rating, gameData.developer, gameData.release_date, gameData.tags,
            gameData.requirements_min_os, gameData.requirements_min_processor, gameData.requirements_min_memory,
            gameData.requirements_min_graphics, gameData.requirements_min_storage,
            gameData.requirements_rec_os, gameData.requirements_rec_processor, gameData.requirements_rec_memory,
            gameData.requirements_rec_graphics, gameData.requirements_rec_storage
          ]
        );
        
        console.log(`  + Juego importado: ${gameData.title} (${gameData.category})`);
        
        gamesImported++;
        
        // Si alcanzamos el límite por género, salir del bucle
        if (gamesImported >= gamesPerGenre) {
          break;
        }
        
        // Pequeña pausa para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Pasar a la siguiente página
      page++;
      
      // Si ya no hay más páginas, salir del bucle
      if (!response.data.next) {
        break;
      }
    }
    
    console.log(`  ✅ ${gamesImported} juegos importados para el género "${genre}"`);
    return gamesImported;
    
  } catch (error) {
    console.error(`  ❌ Error al importar juegos del género "${genre}":`, error);
    return 0;
  }
}

/**
 * Función principal para importar juegos
 */
async function importGames() {
  try {
    console.log('🎮 Iniciando importación mejorada de juegos desde RAWG...');
    
    // Establecer límites
    const totalGamesTarget = 200; // Objetivo total de juegos
    const gamesPerGenre = Math.ceil(totalGamesTarget / GENRES.length); // Distribuir entre géneros
    
    let totalImported = 0;
    
    // Importar juegos para cada género
    for (const genre of GENRES) {
      const importedCount = await importGamesByGenre(genre, gamesPerGenre);
      totalImported += importedCount;
      
      // Pausa entre géneros para no sobrecargar la API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n✅ Importación completada. Total de juegos importados: ${totalImported}`);
    
  } catch (error) {
    console.error('❌ Error durante la importación de juegos:', error);
  } finally {
    // Cerrar la conexión a la base de datos
    await pool.end();
  }
}

// Ejecutar la importación
importGames().catch(error => {
  console.error('❌ Error fatal en la importación:', error);
  process.exit(1);
}); 