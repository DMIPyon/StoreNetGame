import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule, 
    IonicModule, 
    RouterModule, 
    FormsModule, 
    HttpClientModule,
    StarRatingComponent
  ],
})
export class HomePage implements OnInit {
  // Vista de juegos
  games: Game[] = [];
  filteredGames: Game[] = [];
  popularGames: Game[] = [];
  discountedGames: Game[] = [];
  
  // Estado de carga
  isLoading: boolean = true;
  
  // Búsqueda
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  
  // Carrito
  cartItemCount: number = 0;
  
  // Carrusel de ofertas
  @ViewChild('offersContainer') offersContainer!: ElementRef;
  
  // Filtros
  showFilters: boolean = false;
  selectedSortOption: string = 'discount';
  selectedCategory: string[] = [];
  priceRange = { lower: 0, upper: 100000 };
  availableCategories: string[] = [];
  
  constructor(
    private gameService: GameService,
    private router: Router,
    private toastController: ToastController,
    private notificationService: NotificationService,
    private cartService: CartService
  ) {
    this.searchSubject.pipe(debounceTime(300)).subscribe(term => {
      this.searchGames(term);
    });
  }
  
  // Cargar todos los juegos al iniciar
  ngOnInit() {
    this.loadAllData();
    
    // Suscribirse al contador del carrito
    this.cartService.getCartItemCount().subscribe(count => {
      this.cartItemCount = count as number;
    });
  }
  
  // Cargar todos los datos necesarios
  loadAllData() {
    this.isLoading = true;
    
    // Obtener juegos populares y juegos en oferta al mismo tiempo
    forkJoin({
      allGames: this.gameService.getGames(),
      popularGames: this.gameService.getPopularGames(8),
      discountedGames: this.gameService.getDiscountedGames()
    }).subscribe({
      next: (result) => {
        this.games = this.ensureValidImages(result.allGames);
        this.filteredGames = this.games;
        this.popularGames = this.ensureValidImages(result.popularGames);
        this.discountedGames = this.ensureValidImages(result.discountedGames);
        
        // Asegurar que tenemos al menos 8 juegos en oferta
        this.loadMoreDiscountedGames(8);
        
        // Extraer categorías únicas de todos los juegos
        this.extractCategories();
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
        this.isLoading = false;
        this.notificationService.showNotification('Error', 'No se pudieron cargar los juegos');
        
        // Intentar cargar al menos los juegos básicos como fallback
        this.loadGamesAsFallback();
      }
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
  
  // Mostrar/ocultar panel de filtros
  toggleFilters() {
    this.showFilters = !this.showFilters;
  }
  
  // Restablecer filtros a valores por defecto
  resetFilters() {
    this.selectedSortOption = 'discount';
    this.selectedCategory = [];
    this.priceRange = { lower: 0, upper: 100000 };
    this.applyFilters();
  }
  
  // Aplicar filtros seleccionados
  applyFilters() {
    // Primero filtrar por precio y categoría
    let filtered = this.games.filter(game => {
      const priceMatch = game.price >= this.priceRange.lower && game.price <= this.priceRange.upper;
      
      // Si no hay categorías seleccionadas, mostrar todos
      const categoryMatch = this.selectedCategory.length === 0 || 
        (game.categories && game.categories.some(cat => this.selectedCategory.includes(cat)));
      
      return priceMatch && categoryMatch;
    });
    
    // Luego ordenar según la opción seleccionada
    switch(this.selectedSortOption) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'priceAsc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        filtered.sort((a, b) => {
          const discountA = a.discount || 0;
          const discountB = b.discount || 0;
          return discountB - discountA;
        });
        break;
    }
    
    // Actualizar la lista de juegos filtrados y juegos populares
    this.filteredGames = filtered;
    this.popularGames = filtered.slice(0, 8);
    
    // Si el panel de filtros está abierto, cerrarlo
    this.showFilters = false;
  }
  
  // Cargar juegos como método de respaldo si falla el método principal
  private loadGamesAsFallback() {
    this.gameService.getGames().subscribe({
      next: (games) => {
        this.games = this.ensureValidImages(games);
        this.filteredGames = this.games;
        this.popularGames = this.shuffleArray(this.games).slice(0, 8);
        this.discountedGames = this.games
          .filter(game => game.discount && game.discount > 0)
          .slice(0, 10);
        
        // Extraer categorías
        this.extractCategories();
      },
      error: (error) => {
        console.error('Error en el fallback:', error);
      }
    });
  }
  
  // Mezclar array para selección aleatoria
  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
  
  // Asegurar que todas las imágenes tengan valores válidos
  private ensureValidImages(games: Game[]): Game[] {
    return games.map(game => {
      if (!game.image || game.image === 'undefined') {
        game.image = 'assets/img/minecraft.jpg';
      }
      
      // Calcular precio original si hay descuento pero no hay precio original
      if (game.discount && game.discount > 0 && !game.originalPrice) {
        // Calcular el precio original basado en el descuento
        const discountMultiplier = (100 - game.discount) / 100;
        game.originalPrice = Math.round(game.price / discountMultiplier);
      }
      
      return game;
    });
  }
  
  // Actualizar término de búsqueda
  updateSearchTerm(term: string) {
    this.searchSubject.next(term);
  }
  
  // Buscar juegos por término
  searchGames(term: string) {
    if (!term || !term.trim()) {
      this.filteredGames = this.games;
      this.applyFilters(); // Aplicar los filtros actuales
      return;
    }
    
    this.isLoading = true;
    this.gameService.searchGames(term).subscribe({
      next: (games) => {
        this.filteredGames = this.ensureValidImages(games);
        this.popularGames = this.filteredGames.slice(0, 8);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al buscar juegos:', error);
        // Fallback a búsqueda local en caso de error
        this.performLocalSearch(term);
        this.isLoading = false;
      }
    });
  }
  
  // Realizar búsqueda local (como fallback)
  private performLocalSearch(term: string) {
    const searchTermLower = term.toLowerCase();
    this.filteredGames = this.games.filter(game => {
      const titleMatch = game.name.toLowerCase().includes(searchTermLower);
      const descMatch = game.description?.toLowerCase().includes(searchTermLower);
      const devMatch = game.developer?.toLowerCase().includes(searchTermLower);
      const catMatch = game.categories?.some(cat => cat.toLowerCase().includes(searchTermLower));
      const tagMatch = game.tags?.some(tag => tag.toLowerCase().includes(searchTermLower));
      
      return titleMatch || descMatch || devMatch || catMatch || tagMatch;
    });
    
    this.popularGames = this.filteredGames.slice(0, 8);
  }
  
  // Ver detalles del juego
  viewGameDetails(gameId: number) {
    this.router.navigate(['/game-details', gameId]);
  }
  
  // Añadir al carrito
  addToCart(game: Game, event: Event) {
    event.stopPropagation(); // Evitar navegación a detalles
    
    this.cartService.addToCart(game.id);
    this.notificationService.showNotification('Éxito', `${game.name} añadido al carrito`);
  }
  
  // Desplazar a la sección de ofertas
  scrollToOffers() {
    const offersSection = document.getElementById('offersSection');
    if (offersSection) {
      offersSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  // Desplazar el carrusel de ofertas
  scrollOffers(direction: 'left' | 'right') {
    if (this.offersContainer && this.offersContainer.nativeElement) {
      const container = this.offersContainer.nativeElement;
      const scrollAmount = direction === 'left' ? -600 : 600;
      
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }
  
  // Cargar más juegos en oferta si no hay suficientes
  loadMoreDiscountedGames(minCount: number = 8) {
    if (this.discountedGames.length >= minCount) {
      return; // Ya tenemos suficientes juegos en oferta
    }
    
    // Calcular cuántos juegos necesitamos añadir
    const addCount = minCount - this.discountedGames.length;
    
    // Obtener juegos que no estén ya en ofertas
    const availableGames = this.games.filter(
      game => !this.discountedGames.some(dGame => dGame.id === game.id)
    );
    
    if (availableGames.length === 0) {
      return; // No hay más juegos disponibles
    }
    
    // Mezclar y tomar los primeros N juegos
    const gamesForDiscount = this.shuffleArray(availableGames).slice(0, addCount);
    
    // Añadir descuentos simulados a estos juegos
    const additionalDiscounts = gamesForDiscount.map(game => {
      const discountedGame = { ...game };
      // Generar descuento aleatorio entre 15% y 50%
      discountedGame.discount = Math.floor(Math.random() * 35) + 15;
      // Guardar precio original y calcular el precio con descuento
      discountedGame.originalPrice = discountedGame.price;
      discountedGame.price = Math.round(discountedGame.price * (1 - discountedGame.discount / 100));
      return discountedGame;
    });
    
    // Añadir a la lista de juegos en oferta
    this.discountedGames = [...this.discountedGames, ...additionalDiscounts];
  }
}
