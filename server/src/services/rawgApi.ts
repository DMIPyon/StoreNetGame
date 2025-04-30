import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Usar la clave de API proporcionada
const RAWG_API_KEY = process.env.RAWG_API_KEY || 'c5f131835d494f6dbd96e4a46b327024';
const BASE_URL = 'https://api.rawg.io/api';

/**
 * Interfaz para los juegos recibidos de la API de RAWG
 */
interface RawgGame {
  id: number;
  name: string;
  background_image: string;
  description_raw?: string;
  description?: string;
  released?: string;
  rating?: number;
  price?: number; // Este campo no existe en RAWG, lo añadiremos nosotros
  genres?: { id: number; name: string }[];
  platforms?: { platform: { id: number; name: string } }[];
  metacritic?: number;
  esrb_rating?: { id: number; name: string };
}

/**
 * Interfaz para los juegos en nuestro formato
 */
interface Game {
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

/**
 * Busca juegos en la API de RAWG
 * @param query Términos de búsqueda
 * @param page Número de página
 * @param pageSize Tamaño de página
 */
export async function searchGames(query: string, page = 1, pageSize = 20): Promise<RawgGame[]> {
  try {
    const response = await axios.get(`${BASE_URL}/games`, {
      params: {
        key: RAWG_API_KEY,
        search: query,
        page,
        page_size: pageSize
      }
    });
    return response.data.results;
  } catch (error) {
    console.error('Error buscando juegos en RAWG:', error);
    return [];
  }
}

/**
 * Obtiene juegos por género
 * @param genre Género de los juegos
 * @param page Número de página
 * @param pageSize Tamaño de página
 * @param platforms IDs de plataformas para filtrar (opcional)
 */
export async function getGamesByGenre(genre: string, page = 1, pageSize = 20, platforms?: number[]): Promise<RawgGame[]> {
  try {
    const params: any = {
      key: RAWG_API_KEY,
      genres: genre,
      page,
      page_size: pageSize,
      ordering: '-rating' // Ordenar por mejor calificación
    };

    // Añadir plataformas si se proporcionan
    if (platforms && platforms.length > 0) {
      params.platforms = platforms.join(',');
    }

    const response = await axios.get(`${BASE_URL}/games`, { params });
    return response.data.results;
  } catch (error) {
    console.error(`Error obteniendo juegos del género ${genre}:`, error);
    return [];
  }
}

/**
 * Obtiene los juegos populares
 * @param page Número de página
 * @param pageSize Tamaño de página
 */
export async function getPopularGames(page = 1, pageSize = 20): Promise<RawgGame[]> {
  try {
    // Ordenado por popularidad (agregados)
    const response = await axios.get(`${BASE_URL}/games`, {
      params: {
        key: RAWG_API_KEY,
        ordering: '-added',
        page,
        page_size: pageSize
      }
    });
    return response.data.results;
  } catch (error) {
    console.error('Error obteniendo juegos populares de RAWG:', error);
    return [];
  }
}

/**
 * Obtiene detalles de un juego por su ID
 * @param gameId ID del juego en RAWG
 */
export async function getGameDetails(gameId: number): Promise<RawgGame | null> {
  try {
    const response = await axios.get(`${BASE_URL}/games/${gameId}`, {
      params: {
        key: RAWG_API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo detalles del juego ${gameId}:`, error);
    return null;
  }
}

/**
 * Obtiene las plataformas disponibles
 */
export async function getPlatforms(): Promise<any[]> {
  try {
    const response = await axios.get(`${BASE_URL}/platforms`, {
      params: {
        key: RAWG_API_KEY
      }
    });
    return response.data.results;
  } catch (error) {
    console.error('Error obteniendo plataformas de RAWG:', error);
    return [];
  }
}

/**
 * Obtiene los géneros disponibles
 */
export async function getGenres(): Promise<any[]> {
  try {
    const response = await axios.get(`${BASE_URL}/genres`, {
      params: {
        key: RAWG_API_KEY
      }
    });
    return response.data.results;
  } catch (error) {
    console.error('Error obteniendo géneros de RAWG:', error);
    return [];
  }
}

/**
 * Convierte un juego de RAWG a nuestro formato
 * @param rawgGame Juego en formato RAWG
 */
export function convertRawgGameToOurFormat(rawgGame: RawgGame): Game {
  // Asigna un precio aleatorio o un precio fijo según tus necesidades
  const price = rawgGame.price || generateRandomPrice(rawgGame.rating || 0);
  
  // Obtiene la categoría principal del juego (primer género)
  const category = rawgGame.genres && rawgGame.genres.length > 0 
    ? rawgGame.genres[0].name 
    : 'Otro';

  return {
    title: rawgGame.name,
    description: rawgGame.description_raw || rawgGame.description || 'Sin descripción disponible.',
    price,
    image_url: rawgGame.background_image || '',
    category
  };
}

/**
 * Genera un precio aleatorio basado en la calificación del juego
 * @param rating Calificación del juego
 */
function generateRandomPrice(rating: number): number {
  // Los juegos mejor calificados tendrán precios más altos
  const basePrice = rating > 4 ? 59.99 : rating > 3 ? 39.99 : 19.99;
  // Añade algo de variación
  const variation = Math.floor(Math.random() * 10) - 5;
  const finalPrice = basePrice + variation;
  // Redondea a 2 decimales y asegura que no sea negativo
  return Math.max(parseFloat(finalPrice.toFixed(2)), 0.99);
}

/**
 * Importa juegos de RAWG a nuestra base de datos
 * @param count Número de juegos a importar
 */
export async function importGamesFromRawg(count = 50): Promise<Game[]> {
  try {
    // Obtiene juegos populares
    const rawgGames = await getPopularGames(1, count);
    
    // Convierte los juegos al formato de nuestra aplicación
    const games = rawgGames.map(convertRawgGameToOurFormat);
    
    return games;
  } catch (error) {
    console.error('Error importando juegos desde RAWG:', error);
    return [];
  }
} 