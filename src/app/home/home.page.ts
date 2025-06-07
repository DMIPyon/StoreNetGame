import { Component, OnInit, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { GameService } from '../services/game.service';
import { Game } from '../interfaces/game.interface';
import { FormatClpPipe } from '../pipes/format-clp.pipe';
import { HttpClientModule } from '@angular/common/http';
import { NotificationService } from '../services/notification.service';
import { debounceTime, Subject, forkJoin } from 'rxjs';
import { CartService } from '../services/cart.service';
import { StarRatingComponent } from '../components/star-rating/star-rating.component';
import { register } from 'swiper/element';
import { CategoryService, Category } from '../services/category.service';
import { WishlistService } from '../services/wishlist.service';
import { AuthService } from '../services/auth.service';

// Registrar los componentes Swiper
register();

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule, 
    IonicModule, 
    RouterModule, 
    FormsModule, 
    HttpClientModule,
    StarRatingComponent,
    FormatClpPipe
  ],
})
export class HomePage implements OnInit {
  // Vista de juegos
  games: Game[] = [];
  filteredGames: Game[] = [];
  popularGames: Game[] = [];
  discountedGames: Game[] = [];
  featuredGames: Game[] = [];
  topRatedGames: Game[] = [];
  categories: Category[] = [];
  
  // Estado de carga
  isLoading: boolean = true;
  
  // Búsqueda
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  
  // Carrito
  cartItemCount: number = 0;
  
  // Carrusel de ofertas
  @ViewChild('offersContainer') offersContainer!: ElementRef;
  
  // Opciones del slider
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    autoplay: {
      delay: 4000,
    },
    loop: true
  };
  
  // Filtros
  showFilters: boolean = false;
  selectedSortOption: string = 'discount';
  selectedCategoryId: number | null = null;
  priceRange = { lower: 0, upper: 100000 };
  availableCategories: string[] = [];
  activeFiltersCount: number = 0;
  selectedCategoryName: string | null = null;
  hoveredCategory: string | null = null;
  
  isCategoryModalOpen = false;
  
  // Nuevas propiedades para la lista de deseos
  wishlistCount: number = 0;
  gamesInWishlist: number[] = [];
  
  // Autenticación de usuario
  isAuthenticated: boolean = false;
  currentUser: any = null;
  
  // Filtros avanzados
  showAdvancedFilters: boolean = false;
  minRating: string = "0";
  
  showUserDropdown = false;
  showUserCardDropdown = false;
  
  currentBannerIndex: number = 0;
  private bannerInterval: any;
  
  isBannerFading: boolean = false;
  
  isAdmin: boolean = false;
  
  constructor(
    private gameService: GameService,
    private router: Router,
    private toastController: ToastController,
    private notificationService: NotificationService,
    private cartService: CartService,
    private categoryService: CategoryService,
    private wishlistService: WishlistService,
    private authService: AuthService
  ) {
    this.searchSubject.pipe(debounceTime(300)).subscribe(term => {
      this.searchGames(term);
    });
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
      this.isAdmin = user?.role === 'admin';
      console.log("Usuario actual:", user);
    });
  }
  
  // Cargar todos los juegos al iniciar
  ngOnInit() {
    this.loadAllData();
    this.startBannerAutoplay();
    
    // Obtener categorías dinámicamente
    this.categoryService.getCategories().subscribe(cats => {
      // Mapa de colores completo para todas las categorías
      const colorMap: { [key: string]: string } = {
        'Acción': '#FF5733',
        'Aventura': '#33A1FF',
        'Estrategia': '#33FF57',
        'RPG': '#8333FF',
        'Deportes': '#FF33A1',
        'Indie': '#FFB833',
        'Casual': '#33FFB8',
        'Carreras': '#B8B8FF',
        'Simulación': '#FFD700',
        'Shooter': '#FF3333',
        'Puzzle': '#8D33FF',
        'Terror': '#222222',
        'Plataformas': '#FF8C33',
        'Lucha': '#FF3333',
        'Sandbox': '#A1FF33',
        'Mundo Abierto': '#33FFF6',
        'Cooperativo': '#33FFB8',
        'Multijugador': '#33FF57',
        'Ciencia Ficción': '#33A1FF',
        'Fantasía': '#A1FF33',
        'Supervivencia': '#FFB833',
        'Construcción': '#FFD700',
        'Roguelike': '#8D33FF',
        'Metroidvania': '#8333FF',
        'Point & Click': '#FF33A1'
      };
      this.categories = cats.map(cat => ({ ...cat, color: colorMap[cat.name] || '#e3e9f1' }));
    });
    
    // Suscribirse al contador del carrito
    this.cartService.getCartItemCount().subscribe(count => {
      this.cartItemCount = count as number;
    });
    
    // Suscribirse al contador de la lista de deseos
    this.wishlistService.getWishlistItemCount().subscribe(count => {
      this.wishlistCount = count;
    });
    
    // Cargar los IDs de juegos que están en la lista de deseos
    this.loadWishlistGameIds();
  }
  
  /**
   * Carga todos los datos principales de la página de inicio:
   * - Juegos populares
   * - Juegos en oferta
   * - Juegos destacados para el banner
   * - Juegos mejor valorados
   * - Categorías únicas
   */
  loadAllData() {
    this.isLoading = true;
    
    // Obtener juegos populares y juegos en oferta al mismo tiempo
    forkJoin({
      allGames: this.gameService.getGames(),
      popularGames: this.gameService.getPopularGames(8),
      discountedGames: this.gameService.getDiscountedGames()
    }).subscribe({
      next: (result) => {
        this.games = this.processGames(result.allGames);
        this.filteredGames = this.games;
        
        // Verificar y procesar los juegos populares
        this.popularGames = this.processGames(result.popularGames);
        
        // Verificar y procesar los juegos en oferta
        this.discountedGames = this.processGames(result.discountedGames);
        
        // Asegurar que tenemos al menos 8 juegos en oferta
        this.loadMoreDiscountedGames(8);
        
        // Crear juegos destacados para el banner
        this.featuredGames = this.generateFeaturedGames();
        
        // Generar juegos mejor valorados
        this.topRatedGames = this.generateTopRatedGames();
        
        // Extraer categorías únicas de todos los juegos
        this.extractCategories();
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
        this.isLoading = false;
        this.notificationService.showNotification('Error', 'No se pudieron cargar los juegos. Por favor, revisa tu conexión o intenta más tarde.');
        this.loadGamesAsFallback();
      }
    });
  }
  
  /**
   * Muestra un menú desplegable cuando el usuario autenticado hace clic en su perfil
   */
  async presentUserMenu(event: Event) {
    event.stopPropagation();
    
    const popover = document.createElement('ion-popover');
    popover.translucent = true;
    popover.cssClass = 'user-menu-popover';
    
    const menuItems = `
      <ion-list lines="none">
        <ion-item button detail="false" routerLink="/profile">
          <ion-icon name="person-circle-outline" slot="start"></ion-icon>
          <ion-label>Mi Perfil</ion-label>
        </ion-item>
        <ion-item button detail="false" routerLink="/orders">
          <ion-icon name="receipt-outline" slot="start"></ion-icon>
          <ion-label>Mis Compras</ion-label>
        </ion-item>
        <ion-item button detail="false" routerLink="/wishlist">
          <ion-icon name="heart-outline" slot="start"></ion-icon>
          <ion-label>Lista de Deseos</ion-label>
        </ion-item>
        <ion-item button detail="false" (click)="logout()">
          <ion-icon name="log-out-outline" slot="start" color="danger"></ion-icon>
          <ion-label color="danger">Cerrar Sesión</ion-label>
        </ion-item>
      </ion-list>
    `;
    
    popover.innerHTML = menuItems;
    document.body.appendChild(popover);
    
    popover.onDidDismiss().then(() => {
      popover.remove();
    });
    
    await popover.present();
    
    // Agregar manejadores de eventos para los elementos del menú
    document.querySelectorAll('ion-item').forEach(item => {
      item.addEventListener('click', () => {
        popover.dismiss();
        
        // Si el elemento tiene (click)="logout()", ejecutar la función
        if (item.innerHTML.includes('Cerrar Sesión')) {
          this.logout();
        }
      });
    });
  }
  
  /**
   * Cierra la sesión del usuario
   */
  logout() {
    this.authService.logout();
  }
  
  // Manejar errores de carga de imágenes
  onImageError(event: any) {
    // Usar una URL externa de alta calidad para reemplazar imágenes que fallan
    const gameElement = event.target.closest('.game-card, .offer-card, .main-banner');
    if (gameElement) {
      // Determinar si es una imagen de tarjeta o de banner
      const isBanner = gameElement.classList.contains('main-banner');
      
      if (isBanner) {
        // Si es un banner, usar imagen de placeholder más grande
        event.target.src = 'https://placehold.co/1200x600?text=Juego+Premium';
      } else {
        // Para tarjetas de juego, usar imagen de tamaño mediano
        event.target.src = 'https://placehold.co/400x200?text=Juego+Disponible';
      }
      
      // Añadir clase para mejorar la presentación de la imagen de fallback
      event.target.classList.add('placeholder-image');
    } else {
      // Imagen genérica si no podemos determinar el contexto
      event.target.src = 'https://placehold.co/400x200?text=Juego+No+Disponible';
    }
  }
  
  // Procesar juegos para asegurar propiedades consistentes
  private processGames(games: Game[]): Game[] {
    return games.map(game => {
      // Ya no es necesario ningún fallback, solo usar cover_url
      return game;
    });
  }
  
  // Extraer categorías únicas de los juegos
  private extractCategories() {
    const categories = new Set<string>();
    
    this.games.forEach(game => {
      if (game.categories && game.categories.length > 0) {
        game.categories.forEach(category => {
          categories.add(category);
        });
      }
    });
    
    this.availableCategories = Array.from(categories).sort();
  }
  
  // Generar juegos destacados para el carrusel
  private generateFeaturedGames(): Game[] {
    // Seleccionamos juegos para destacar en el banner
    // Priorizamos los juegos con mejor valoración y descuento
    const potentialFeatured = [...this.games]
      // Asegurar que tienen imágenes de alta calidad (no URLs relativas)
      .filter(game => 
        game.cover_url && 
        game.cover_url.startsWith('http') && 
        // Preferir imágenes de fuentes conocidas de alta calidad
        (
          game.cover_url.includes('image.api.playstation.com') || 
          game.cover_url.includes('media.rawg.io') || 
          game.cover_url.includes('upload.wikimedia.org') ||
          game.cover_url.includes('cdn.akamai.steamstatic.com')
        ) &&
        // Juegos de alta calidad o con descuento
        ((game.rating && game.rating > 4) || (game.discount && game.discount > 15))
      )
      // Eliminamos posibles duplicados por id
      .filter((game, index, self) => 
        index === self.findIndex((g) => g.id === game.id)
      )
      // Ordenamos por rating y descuento
      .sort((a, b) => {
        const aRating = a.rating || 0;
        const bRating = b.rating || 0;
        const aDiscount = a.discount || 0;
        const bDiscount = b.discount || 0;
        return (bRating + bDiscount/20) - (aRating + aDiscount/20);
      });
    
    // Si no tenemos suficientes juegos de alta calidad, completar con otros
    if (potentialFeatured.length < 3) {
      const additionalGames = [...this.games]
        .filter(game => 
          game.cover_url && 
          game.cover_url.startsWith('http') &&
          !potentialFeatured.some(featured => featured.id === game.id)
        )
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 5 - potentialFeatured.length);
      
      potentialFeatured.push(...additionalGames);
    }
    
    // Asegurar que tenemos juegos variados (distintos géneros)
    const diverseGames: Game[] = [];
    const categoriesSeen = new Set<string>();
    
    // Intentar tener juegos de categorías diferentes
    for (const game of potentialFeatured) {
      if (diverseGames.length >= 5) break;
      
      const mainCategory = game.categories?.[0] || '';
      if (!mainCategory || !categoriesSeen.has(mainCategory)) {
        categoriesSeen.add(mainCategory);
        diverseGames.push(game);
      }
    }
    
    // Si no logramos diversidad, completar con los mejores juegos
    while (diverseGames.length < 5 && diverseGames.length < potentialFeatured.length) {
      const nextGame = potentialFeatured.find(game => 
        !diverseGames.some(g => g.id === game.id)
      );
      if (nextGame) {
        diverseGames.push(nextGame);
      } else {
        break;
      }
    }
    
    // Tomar hasta 5 juegos para el banner
    return diverseGames.map(game => {
      // Crear una descripción personalizada en español
      if (!game.description || 
          game.description.trim() === '' || 
          game.description === 'Sin descripción disponible' || 
          game.description === 'Sin descripción disponible.' || 
          game.description.includes('WARNING') || 
          game.description.includes('explicit') || 
          game.description.includes('nudity') ||
          game.description.includes('Languages:')) {
        if (game.discount && game.discount > 0) {
          game.description = `¡Aprovecha y ahorra un ${game.discount}% en este increíble juego! Uno de los favoritos de nuestra tienda.`;
        } else {
          game.description = 'Uno de los juegos mejor valorados por nuestros usuarios. ¡No te lo pierdas!';
        }
      }
      
      // Asegurar que las descripciones no sean demasiado largas para el banner
      if (game.description && game.description.length > 120) {
        game.description = game.description.substring(0, 117) + '...';
      }
      
      return game;
    });
  }
  
  // Generar lista de juegos mejor valorados
  private generateTopRatedGames(): Game[] {
    return [...this.games]
      .filter(game => game.rating && game.rating > 4.0)
      .sort((a, b) => {
        const aRating = a.rating || 0;
        const bRating = b.rating || 0;
        return bRating - aRating;
      })
      .slice(0, 6);
  }
  
  // Mostrar/ocultar panel de filtros
  toggleFilters() {
    this.showFilters = !this.showFilters;
  }
  
  /**
   * Aplica el filtro por categoría. Si se selecciona la misma, deselecciona.
   * Actualiza el filtro visual y la lista de juegos mostrados.
   */
  filterByCategory(categoryId: number) {
    this.selectedCategoryId = categoryId;
    this.applyFilters();
  }
  
  // Mostrar/ocultar filtros avanzados
  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }
  
  // Manejar cambio de calificación
  onRatingChange() {
    this.applyFilters();
  }
  
  // Restablecer filtros a valores por defecto
  resetFilters() {
    this.selectedCategoryId = null;
    this.selectedCategoryName = null;
    this.priceRange = { lower: 0, upper: 100000 };
    this.selectedSortOption = 'discount';
    this.minRating = "0";
    this.showAdvancedFilters = false;
    this.applyFilters();
    
    // Mostrar mensaje de confirmación
    this.toastController.create({
      message: 'Filtros restablecidos correctamente',
      duration: 2000,
      position: 'bottom',
      color: 'success',
      icon: 'checkmark-circle-outline'
    }).then(toast => toast.present());
  }
  
  /**
   * Aplica todos los filtros activos (categoría, precio, orden, etc.)
   * y actualiza la lista de juegos mostrados.
   */
  applyFilters() {
    // console.log('Aplicando filtros. Categoría seleccionada ID:', this.selectedCategoryId);
    
    // Iniciar con todos los juegos
    let filtered = [...this.games];
    // console.log('Total de juegos antes de filtrar:', filtered.length);
    
    // Depurar la estructura de algunos juegos para ver cómo están sus categorías
    if (filtered.length > 0) {
      // console.log('Estructura del primer juego:', JSON.stringify({
      //   id: filtered[0].id,
      //   title: filtered[0].title,
      //   categories: filtered[0].categories,
      //   category_ids: filtered[0].category_ids
      // }));
    }
    
    // Depurar categorías disponibles
    // console.log('Categorías disponibles:', this.categories);
    
    // Filtrar por categoría si hay una seleccionada
    if (this.selectedCategoryId !== null) {
      const category = this.categories.find(c => c.id === this.selectedCategoryId);
      // console.log('Categoría encontrada por ID:', category);
      
      if (!category) {
        // console.error('¡Error! No se encontró la categoría con ID:', this.selectedCategoryId);
        return;
      }
      
      const categoryName = category.name;
      this.selectedCategoryName = categoryName;
      
      // console.log('Filtrando por categoría:', categoryName);
      
      // Filtrar juegos por categoría
      filtered = filtered.filter(game => {
        // Primero verificar si el juego tiene categorías
        if (!game.categories || !Array.isArray(game.categories)) {
          // console.log(`Juego ${game.id} (${game.title}) no tiene categorías definidas`);
          return false;
        }
        
        // Verificar si la categoría actual está en las categorías del juego
        const hasCategory = game.categories.some(cat => {
          const normalizedCat = this.normalizeString(cat);
          const normalizedCategory = this.normalizeString(categoryName);
          
          // Comparación exacta con normalización
          const exactMatch = normalizedCat === normalizedCategory;
          
          // Comparación contenida (por si acaso hay inconsistencias)
          const containsMatch = normalizedCat.includes(normalizedCategory) || 
                               normalizedCategory.includes(normalizedCat);
          
          if (exactMatch || containsMatch) {
            // console.log(`Juego ${game.id} (${game.title}) coincide con categoría ${categoryName}`);
            return true;
          }
          return false;
        });
        
        // Verificar por category_ids también (otra forma en que pueden estar asociadas las categorías)
        if (!hasCategory && game.category_ids && Array.isArray(game.category_ids)) {
          const hasCategoryById = game.category_ids.includes(this.selectedCategoryId as number);
          
          if (hasCategoryById) {
            // console.log(`Juego ${game.id} (${game.title}) coincide por category_ids con ${categoryName}`);
            return true;
          }
        }
        
        return hasCategory;
      });
      
      // console.log('Juegos filtrados por categoría:', filtered.length);
      
      // Si no se encontraron juegos, probar una estrategia alternativa
      if (filtered.length === 0) {
        // console.log('No se encontraron juegos con la estrategia principal. Probando alternativa...');
        
        // Buscar de forma menos estricta (cualquier coincidencia parcial)
        filtered = this.games.filter(game => {
          if (!game.categories || !Array.isArray(game.categories)) return false;
          
          return game.categories.some(cat => {
            const normalizedCat = this.normalizeString(cat);
            const normalizedCategory = this.normalizeString(categoryName);
            
            // Verificar si una contiene a la otra de alguna forma
            return normalizedCat.includes(normalizedCategory) || 
                   normalizedCategory.includes(normalizedCat);
          });
        });
        
        // console.log('Juegos encontrados con estrategia alternativa:', filtered.length);
      }
    } else {
      this.selectedCategoryName = null;
    }
    
    // Filtrar por rango de precio
    filtered = filtered.filter(game => 
      game.price >= this.priceRange.lower && game.price <= this.priceRange.upper
    );
    
    // Filtrar por calificación mínima
    const minRatingValue = parseFloat(this.minRating);
    if (minRatingValue > 0) {
      filtered = filtered.filter(game => (game.rating || 0) >= minRatingValue);
    }
    
    // Ordenar según la opción seleccionada
    switch(this.selectedSortOption) {
      case 'price':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'discount':
        filtered.sort((a, b) => {
          const discountA = a.discount || 0;
          const discountB = b.discount || 0;
          return discountB - discountA;
        });
        break;
      case 'newest':
        // Para demo, ordenamos por id (asumiendo que ids más altos son más recientes)
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'rating':
        filtered.sort((a, b) => {
          const aRating = a.rating || 0;
          const bRating = b.rating || 0;
          return bRating - aRating;
        });
        break;
    }
    
    // Actualizar la lista de juegos filtrados y juegos populares
    this.filteredGames = filtered;
    this.popularGames = this.filteredGames.slice(0, 8);
    
    // console.log('Filtrado finalizado. Juegos resultantes:', this.filteredGames.length);
    
    // Actualizar el contador de filtros activos
    this.countActiveFilters();
  }
  
  // Contar cuántos filtros activos hay
  private countActiveFilters() {
    let count = 0;
    
    // Verificar si hay categorías seleccionadas
    if (this.selectedCategoryId !== null) count++;
    
    // Verificar si el rango de precio no es el predeterminado
    if (this.priceRange.lower > 0 || this.priceRange.upper < 100000) count++;
    
    // Verificar si la opción de ordenar no es la predeterminada
    if (this.selectedSortOption !== 'discount') count++;
    
    // Verificar si hay calificación mínima
    if (this.minRating !== "0") count++;
    
    this.activeFiltersCount = count;
  }
  
  // Cargar juegos como método de respaldo si falla el método principal
  private loadGamesAsFallback() {
    this.gameService.getGames().subscribe({
      next: (games) => {
        this.games = this.processGames(games);
        this.filteredGames = this.games;
        this.popularGames = this.shuffleArray(this.games).slice(0, 8);
        this.discountedGames = this.games
          .filter(game => game.discount && game.discount > 0)
          .slice(0, 10);
        
        // Generar juegos featured y top-rated
        this.featuredGames = this.generateFeaturedGames();
        this.topRatedGames = this.generateTopRatedGames();
        
        // Extraer categorías
        this.extractCategories();
      },
      error: (error) => {
        console.error('Error en el fallback:', error);
      }
    });
  }
  
  // Barajar un array (útil para selecciones aleatorias)
  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
  
  // Actualizar término de búsqueda desde la interfaz
  updateSearchTerm(term: string) {
    this.searchSubject.next(term);
  }
  
  // Buscar juegos por término
  searchGames(term: string) {
    if (!term || term.trim() === '') {
      // Si el término está vacío, mostrar todos los juegos
      this.filteredGames = this.games;
      this.popularGames = this.games.slice(0, 8);
      return;
    }
    
    // Primero, intentar buscar en el servidor si está disponible
    this.gameService.searchGames(term).subscribe({
      next: (results) => {
        if (results && results.length > 0) {
          this.filteredGames = this.processGames(results);
          this.popularGames = this.filteredGames.slice(0, 8);
        } else {
          // Si no hay resultados del servidor, buscar localmente
          this.performLocalSearch(term);
        }
      },
      error: (error) => {
        console.error('Error en la búsqueda:', error);
        // En caso de error, buscar localmente
        this.performLocalSearch(term);
      }
    });
  }
  
  // Realizar búsqueda local en juegos ya cargados
  private performLocalSearch(term: string) {
    const searchTerm = term.toLowerCase();
    
    // Filtrar juegos que coincidan con el término
    this.filteredGames = this.games.filter(game => 
      game.title.toLowerCase().includes(searchTerm) || 
      (game.description && game.description.toLowerCase().includes(searchTerm)) ||
      (game.categories && game.categories.some(cat => cat.toLowerCase().includes(searchTerm)))
    );
    
    // Actualizar la vista de juegos populares
    this.popularGames = this.filteredGames.slice(0, 8);
  }
  
  /**
   * Muestra los detalles de un juego seleccionado.
   */
  viewGameDetails(gameId: number) {
    this.router.navigate(['/game-details', gameId]);
  }
  
  // Añadir juego al carrito
  addToCart(game: Game, event: Event) {
    event.stopPropagation(); // Evitar navegación a detalles
    
    // Animar el badge del carrito
    const badge = document.querySelector('ion-badge');
    if (badge) {
      badge.classList.remove('cart-badge-animation');
      // Forzar reflow para reiniciar la animación
      void badge.offsetWidth;
      badge.classList.add('cart-badge-animation');
    }
    
    this.cartService.addToCart(game.id).subscribe({
      next: () => {
        this.toastController.create({
          message: `${game.title || game.name} agregado al carrito`,
          duration: 2000,
          position: 'bottom',
          color: 'success',
          icon: 'checkmark-circle-outline'
        }).then(toast => toast.present());
      },
      error: (error) => {
        console.error('Error al agregar al carrito:', error);
        this.toastController.create({
          message: 'Error al agregar el producto al carrito',
          duration: 3000,
          position: 'bottom',
          color: 'danger',
          icon: 'alert-circle-outline'
        }).then(toast => toast.present());
      }
    });
  }
  
  // Comprar ahora (añadir al carrito e ir directo a checkout)
  buyNow(game: Game, event: Event) {
    event.stopPropagation(); // Evitar navegación a detalles
    
    // Animar el badge del carrito
    const badge = document.querySelector('ion-badge');
    if (badge) {
      badge.classList.remove('cart-badge-animation');
      // Forzar reflow para reiniciar la animación
      void badge.offsetWidth;
      badge.classList.add('cart-badge-animation');
    }
    
    this.cartService.addToCart(game.id).subscribe({
      next: () => {
        this.toastController.create({
          message: `${game.title || game.name} agregado al carrito`,
          duration: 1500,
          position: 'bottom',
          color: 'success',
          icon: 'checkmark-circle-outline'
        }).then(toast => {
          toast.present();
          
          // Después de 1.5 segundos, redirigir al checkout
          setTimeout(() => {
            this.router.navigate(['/cart']);
          }, 1500);
        });
      },
      error: (error) => {
        console.error('Error al agregar al carrito:', error);
        this.toastController.create({
          message: 'Error al agregar el producto al carrito',
          duration: 3000,
          position: 'bottom',
          color: 'danger',
          icon: 'alert-circle-outline'
        }).then(toast => toast.present());
      }
    });
  }
  
  // Desplazarse a la sección de ofertas
  scrollToOffers() {
    const offsetElement = document.getElementById('offersSection');
    if (offsetElement) {
      offsetElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  // Desplazar el carrusel de ofertas
  scrollOffers(direction: 'left' | 'right') {
    if (!this.offersContainer) return;
    
    const container = this.offersContainer.nativeElement;
    const cardWidth = 300; // Ancho aproximado de una tarjeta + margen
    
    if (direction === 'left') {
      container.scrollLeft -= cardWidth;
    } else {
      container.scrollLeft += cardWidth;
    }
  }
  
  // Asegurar que hay suficientes juegos en oferta
  loadMoreDiscountedGames(minCount: number = 8) {
    if (this.discountedGames.length >= minCount) return;
    
    // Si no hay suficientes juegos con descuento, añadir algunos juegos populares
    // simulando que tienen descuento
    const moreGames = this.games
      .filter(g => !this.discountedGames.some(d => d.id === g.id))
      .slice(0, minCount - this.discountedGames.length)
      .map(game => {
        const clone = { ...game };
        if (!clone.discount || clone.discount === 0) {
          clone.discount = Math.floor(Math.random() * 30) + 15; // Descuento entre 15% y 45%
          clone.originalPrice = clone.price;
          clone.price = Math.round(clone.price * (1 - clone.discount / 100));
        }
        return clone;
      });
    
    this.discountedGames = [...this.discountedGames, ...moreGames];
  }

  private normalizeString(str: string): string {
    return str ? str.normalize('NFD').replace(/[0-\u036f]/g, '').toLowerCase().trim() : '';
  }

  openCategoryModal() {
    this.isCategoryModalOpen = true;
  }

  closeCategoryModal() {
    this.isCategoryModalOpen = false;
  }

  selectCategoryFromModal(categoryId: number | null) {
    // console.log('Categoría seleccionada desde modal:', categoryId);
    this.selectedCategoryId = categoryId;
    
    // Si se seleccionó una categoría, buscar su nombre para mostrarlo
    if (categoryId !== null) {
      const category = this.categories.find(c => c.id === categoryId);
      // console.log('Categoría encontrada:', category);
    }
    
    // Aplicar filtros para actualizar la lista de juegos
    this.applyFilters();
    
    // Cerrar el modal
    this.closeCategoryModal();
  }

  // Cargar los IDs de juegos que están en la lista de deseos
  private loadWishlistGameIds() {
    this.wishlistService.getWishlistItems().subscribe(items => {
      this.gamesInWishlist = items.map(item => item.game_id);
    });
  }
  
  // Verificar si un juego está en la lista de deseos
  isGameInWishlist(gameId: number): boolean {
    return this.gamesInWishlist.includes(gameId);
  }
  
  // Añadir o eliminar de la lista de deseos
  toggleWishlist(game: Game, event: Event) {
    event.stopPropagation(); // Evitar navegación a detalles
    
    if (this.isGameInWishlist(game.id)) {
      // Si ya está en la lista, eliminarlo
      this.wishlistService.removeFromWishlist(game.id).subscribe(() => {
        this.loadWishlistGameIds();
      });
    } else {
      // Si no está en la lista, añadirlo
      this.wishlistService.addToWishlist(game).subscribe(() => {
        this.loadWishlistGameIds();
      });
    }
  }

  toggleUserDropdown(event: Event) {
    event.stopPropagation();
    this.showUserDropdown = !this.showUserDropdown;
    if (this.showUserDropdown) {
      setTimeout(() => {
        document.addEventListener('click', this.handleOutsideClick, true);
      }, 0);
    }
  }

  closeUserDropdown() {
    this.showUserDropdown = false;
    document.removeEventListener('click', this.handleOutsideClick, true);
  }

  handleOutsideClick = (event: Event) => {
    const dropdown = document.querySelector('.user-dropdown-menu');
    if (dropdown && !dropdown.contains(event.target as Node)) {
      this.closeUserDropdown();
    }
  };

  toggleUserCardDropdown(event: Event) {
    event.stopPropagation();
    this.showUserCardDropdown = !this.showUserCardDropdown;
    if (this.showUserCardDropdown) {
      setTimeout(() => {
        document.addEventListener('click', this.handleOutsideClickCard, true);
      }, 0);
    }
  }

  closeUserCardDropdown() {
    // Introduce un pequeño retraso antes de ocultar el menú
    // setTimeout(() => {
      this.showUserCardDropdown = false;
      document.removeEventListener('click', this.handleOutsideClickCard, true);
      // Si el menú se agrega/elimina del DOM, quizás necesitas lógica adicional aquí
      // Por ahora, solo cambiamos el estado para ocultarlo via *ngIf
    // }, 100); // 100ms de retraso
  }

  handleOutsideClickCard = (event: Event) => {
    const dropdown = document.querySelector('.user-card-dropdown');
    if (dropdown && !dropdown.contains(event.target as Node)) {
      this.closeUserCardDropdown();
    }
  };

  goToProfile() {
    this.router.navigateByUrl('/profile');
  }

  goToOrders() {
    this.router.navigateByUrl('/order-history');
    // El cierre del menú se maneja en el HTML, pero agregamos un pequeño retraso aquí también
    setTimeout(() => {
      this.closeUserCardDropdown();
    }, 50);
  }

  goToWallet() {
    this.router.navigateByUrl('/wallet');
    // El cierre del menú se maneja en el HTML, pero agregamos un pequeño retraso aquí también
    setTimeout(() => {
      this.closeUserCardDropdown();
    }, 50);
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  startBannerAutoplay() {
    if (this.bannerInterval) clearInterval(this.bannerInterval);
    this.bannerInterval = setInterval(() => {
      this.nextBanner();
    }, 6000); // Cambia cada 6 segundos
  }

  prevBanner(event?: Event) {
    if (event) event.stopPropagation();
    this.isBannerFading = true;
    setTimeout(() => {
      this.currentBannerIndex = (this.currentBannerIndex - 1 + this.featuredGames.length) % this.featuredGames.length;
      this.isBannerFading = false;
    }, 700);
    this.startBannerAutoplay();
  }

  nextBanner(event?: Event) {
    if (event) event.stopPropagation();
    this.isBannerFading = true;
    setTimeout(() => {
      this.currentBannerIndex = (this.currentBannerIndex + 1) % this.featuredGames.length;
      this.isBannerFading = false;
    }, 700);
    this.startBannerAutoplay();
  }

  ngOnDestroy() {
    if (this.bannerInterval) clearInterval(this.bannerInterval);
  }
}

