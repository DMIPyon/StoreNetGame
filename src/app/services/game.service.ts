import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Game } from '../interfaces/game.interface';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Obtener todos los juegos
  getGames(): Observable<Game[]> {
    return this.http.get<any>(`${this.apiUrl}/games`).pipe(
      map(response => {
        // La respuesta puede ser un objeto con { juegos: [...], Count: number }
        const games = Array.isArray(response) ? response : response.juegos || response;
        return this.adaptApiGames(games);
      }),
      catchError(error => {
        console.error('Error al cargar juegos desde la API:', error);
        // Si hay un error en la API, mostrar en consola información detallada
        if (error.status) {
          console.error(`Estado HTTP: ${error.status}, Mensaje: ${error.message}`);
        }
        return throwError(() => new Error('No se pudieron cargar los juegos. Verifica que el servidor backend esté funcionando en el puerto 3000.'));
      })
    );
  }

  // Obtener juegos en oferta
  getDiscountedGames(): Observable<Game[]> {
    return this.http.get<any>(`${this.apiUrl}/games/discounted`).pipe(
      map(response => {
        const games = Array.isArray(response) ? response : response.juegos || response;
        return this.adaptApiGames(games);
      }),
      catchError(error => {
        console.error('Error al cargar juegos en oferta:', error);
        return throwError(() => new Error('No se pudieron cargar los juegos en oferta.'));
      })
    );
  }

  // Obtener juegos más populares
  getPopularGames(limit: number = 8): Observable<Game[]> {
    return this.http.get<any>(`${this.apiUrl}/games/popular?limit=${limit}`).pipe(
      map(response => {
        const games = Array.isArray(response) ? response : response.juegos || response;
        return this.adaptApiGames(games);
      }),
      catchError(error => {
        console.error('Error al cargar juegos populares:', error);
        return throwError(() => new Error('No se pudieron cargar los juegos populares.'));
      })
    );
  }

  // Mezclar array (para selección aleatoria)
  private shuffleArray(array: any[]): any[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  // Obtener un juego por ID
  getGameById(id: number): Observable<Game> {
    return this.http.get<any>(`${this.apiUrl}/games/${id}`).pipe(
      map(game => this.adaptApiGames([game])[0]),
      catchError(error => {
        console.error(`Error al cargar el juego con ID ${id} desde la API:`, error);
        return throwError(() => new Error(`No se pudo cargar el juego con ID ${id}.`));
      })
    );
  }

  // Obtener juegos relacionados
  getRelatedGames(game: Game): Observable<Game[]> {
    if (!game.categories || game.categories.length === 0) {
      return this.getPopularGames(4);
    }

    return this.http.get<any>(`${this.apiUrl}/games/category/${game.categories[0]}`).pipe(
      map(response => {
        const games = Array.isArray(response) ? response : response.juegos || response;
        return this.adaptApiGames(games).filter(g => g.id !== game.id).slice(0, 4);
      }),
      catchError(error => {
        console.error('Error al cargar juegos relacionados:', error);
        return this.getPopularGames(4);
      })
    );
  }

  // Buscar juegos por término de búsqueda
  searchGames(query: string): Observable<Game[]> {
    if (!query.trim()) {
      return this.getGames();
    }

    return this.http.get<any>(`${this.apiUrl}/games/search?q=${query}`).pipe(
      map(response => {
        const games = Array.isArray(response) ? response : response.juegos || response;
        return this.adaptApiGames(games);
      }),
      catchError(error => {
        console.error(`Error al buscar juegos con el término "${query}" desde la API:`, error);
        return throwError(() => new Error(`No se pudieron buscar juegos con el término "${query}".`));
      })
    );
  }

  // Adaptar los juegos de la API al formato que espera la aplicación
  private adaptApiGames(apiGames: any[]): Game[] {
    if (!apiGames || !Array.isArray(apiGames)) {
      console.error('Los datos recibidos no son un array válido:', apiGames);
      return [];
    }
    return apiGames.map(game => {
      try {
        // Usar solo cover_url y banner_url del backend
        const coverUrl = game.cover_url || 'https://via.placeholder.com/400x600?text=No+Cover';
        const bannerUrl = game.banner_url || null;
        // Crear una copia del juego con la estructura correcta
        const adaptedGame: Game = {
          id: game.id || 0,
          name: game.title || game.name || 'Sin título',
          title: game.title || game.name || 'Sin título',
          price: typeof game.price === 'string' ? parseFloat(game.price) : game.price || 0,
          originalPrice: game.original_price || game.originalPrice || null,
          cover_url: coverUrl,
          banner_url: bannerUrl,
          description: game.description || '',
          categories: Array.isArray(game.category) ? game.category : game.category ? [game.category] : game.categories || [],
          category_ids: game.category_ids || [],
          developer: game.developer || 'Desarrollador desconocido',
          releaseDate: game.release_date || game.releaseDate || game.created_at || 'Fecha desconocida',
          tags: Array.isArray(game.tags) ? game.tags : [],
          rating: !isNaN(Number(game.rating)) ? Number(game.rating) : 3.5,
          discount: typeof game.discount === 'number' ? game.discount : 0,
          requirements: {
            minimum: {
              os: game.requirements_min_os || 'Windows 10',
              processor: game.requirements_min_processor || 'Intel Core i5',
              memory: game.requirements_min_memory || '8 GB RAM',
              graphics: game.requirements_min_graphics || 'NVIDIA GTX 1050',
              storage: game.requirements_min_storage || '50 GB'
            },
            recommended: {
              os: game.requirements_rec_os || 'Windows 11',
              processor: game.requirements_rec_processor || 'Intel Core i7',
              memory: game.requirements_rec_memory || '16 GB RAM',
              graphics: game.requirements_rec_graphics || 'NVIDIA RTX 2060',
              storage: game.requirements_rec_storage || '50 GB SSD'
            }
          }
        };
        // Calcular precio original si hay descuento pero no hay precio original
        if (typeof adaptedGame.discount === 'number' && adaptedGame.discount > 0 && !adaptedGame.originalPrice) {
          const discountMultiplier = (100 - adaptedGame.discount) / 100;
          adaptedGame.originalPrice = Math.round(adaptedGame.price / discountMultiplier);
        }
        return adaptedGame;
      } catch (error) {
        console.error('Error al adaptar el juego:', error, game);
        return null;
      }
    }).filter(game => game !== null) as Game[];
  }

  private getSpanishDescription(title: string, category: string): string {
    type GameDescriptions = {
      [key: string]: string;
      Action: string;
      Adventure: string;
      RPG: string;
      Strategy: string;
      Shooter: string;
      Sports: string;
      Racing: string;
      Puzzle: string;
      Indie: string;
      Simulation: string;
      default: string;
    };

    const descriptions: GameDescriptions = {
      Action: `${title} es un emocionante juego de acción que te sumergirá en una aventura llena de adrenalina. Con gráficos impresionantes y una jugabilidad fluida, cada momento es una nueva oportunidad para demostrar tus habilidades.`,
      Adventure: `Embárcate en una inolvidable aventura con ${title}. Explora mundos fascinantes, resuelve intrigantes misterios y descubre una historia cautivadora que te mantendrá en vilo hasta el final.`,
      RPG: `Sumérgete en un épico mundo de fantasía con ${title}. Personaliza tu personaje, toma decisiones que afectarán al mundo y vive una historia rica en detalles y consecuencias.`,
      Strategy: `${title} es un desafiante juego de estrategia que pondrá a prueba tu capacidad de planificación y toma de decisiones. Desarrolla tus tácticas y lidera a tu equipo hacia la victoria.`,
      Shooter: `Prepárate para la acción intensa en ${title}. Con un arsenal diverso de armas y enemigos desafiantes, cada partida es una nueva oportunidad para demostrar tu puntería y reflejos.`,
      Sports: `Vive la emoción del deporte con ${title}. Compite al más alto nivel, mejora tus habilidades y alcanza la gloria en este realista simulador deportivo.`,
      Racing: `Siente la velocidad y la adrenalina en ${title}. Compite en emocionantes carreras, personaliza tus vehículos y demuestra que eres el mejor piloto en la pista.`,
      Puzzle: `Pon a prueba tu ingenio con ${title}. Resuelve intrigantes rompecabezas y supera desafiantes niveles que estimularán tu mente y creatividad.`,
      Indie: `Descubre una experiencia única y original con ${title}. Este juego independiente te ofrece una perspectiva fresca y creativa que te cautivará desde el primer momento.`,
      Simulation: `Experimenta el realismo y la precisión en ${title}. Este simulador te permite vivir experiencias auténticas y tomar el control total de tu entorno virtual.`,
      default: `${title} es un emocionante juego que ofrece una experiencia única para los jugadores. Con gráficos impresionantes y una jugabilidad cautivadora, este título promete horas de entretenimiento para todo tipo de gamers.`
    };

    return descriptions[category] || descriptions.default;
  }
} 