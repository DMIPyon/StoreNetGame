import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GameService } from '../services/game.service';
import { Game } from '../interfaces/game.interface';
import { CartService } from '../services/cart.service';
import { FormatClpPipe } from '../pipes/format-clp.pipe';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NgZone } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-game-details',
  standalone: true,
  templateUrl: './game-details.page.html',
  styleUrls: ['./game-details.page.scss'],
  imports: [CommonModule, IonicModule, RouterModule, FormatClpPipe, FormsModule]
})
export class GameDetailsPage implements OnInit {
  game: Game | null = null;
  relatedGames: Game[] = [];
  loading = true;
  cartItemCount: number = 0;
  searchTerm: string = '';
  isSearchModalOpen: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private gameService: GameService,
    private cartService: CartService,
    private toastController: ToastController,
    private notificationService: NotificationService,
    private router: Router,
    private title: Title,
    private ngZone: NgZone,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadGameDetails();
    
    // Suscribirse al contador de elementos del carrito
    this.cartService.getCartItemCount().subscribe(count => {
      this.cartItemCount = count;
    });
  }

  async loadGameDetails() {
    try {
      this.loading = true;
      const gameId = this.activatedRoute.snapshot.paramMap.get('id');
      
      if (!gameId) {
        this.router.navigate(['/home']);
        return;
      }

      const game = await firstValueFrom(this.gameService.getGameById(Number(gameId)));
      
      if (!game) {
        this.router.navigate(['/home']);
        return;
      }

      this.game = game;

      // Manejar la descripción
      if (!this.game.description || 
          this.game.description.trim() === '' || 
          this.game.description === 'Sin descripción disponible' ||
          this.game.description === 'Sin descripción disponible.' ||
          this.game.description.includes('WARNING') || 
          this.game.description.includes('explicit') || 
          this.game.description.includes('nudity') ||
          this.game.description.includes('Languages:')) {
        this.game.description = 'Un emocionante juego que ofrece una experiencia única para los jugadores. Con gráficos impresionantes y una jugabilidad cautivadora, este título promete horas de entretenimiento para todo tipo de gamers.';
      }

      // Cargar juegos relacionados
      try {
        const relatedGames = await firstValueFrom(this.gameService.getRelatedGames(this.game));
        this.relatedGames = relatedGames.filter(g => g.id !== this.game?.id);
      } catch (error) {
        console.error('Error al cargar juegos relacionados:', error);
        this.relatedGames = [];
      }
      
      // Actualizar el título de la página
      this.title.setTitle(`${this.game.name} - StoreNetGames`);
      
    } catch (error) {
      console.error('Error al cargar los detalles del juego:', error);
      this.router.navigate(['/home']);
    } finally {
      this.loading = false;
    }
  }

  // Método para obtener una imagen de mejor calidad
  getHighQualityImage(imageUrl: string): string {
    if (!imageUrl) {
      return 'https://via.placeholder.com/1200x600?text=Imagen+No+Disponible';
    }
    
    // Si la URL no comienza con http, probablemente sea una ruta relativa o inválida
    if (!imageUrl.startsWith('http')) {
      return 'https://via.placeholder.com/1200x600?text=Imagen+No+Disponible';
    }
    
    // Mejorar calidad para imágenes de PlayStation
    if (imageUrl.includes('image.api.playstation.com')) {
      // Las URLs de PlayStation ya suelen ser de alta calidad, pero aseguremos
      // que estamos usando la versión completa y no una miniatura
      
      // Si contiene parámetros de tamaño como width=300, intentar eliminarlos
      if (imageUrl.includes('?') && 
          (imageUrl.includes('width=') || imageUrl.includes('w=') || 
           imageUrl.includes('height=') || imageUrl.includes('h='))) {
        // Obtener la URL base sin parámetros
        return imageUrl.split('?')[0];
      }
      return imageUrl;
    }
    
    // Mejorar calidad para imágenes de RAWG
    if (imageUrl.includes('media.rawg.io')) {
      // RAWG a veces proporciona imágenes más pequeñas como crop/600/400
      // Buscamos versiones sin esos parámetros
      if (imageUrl.includes('/crop/') || imageUrl.includes('/resize/')) {
        // Intentar extraer la parte básica de la URL antes de los modificadores
        const baseParts = imageUrl.split('/media/');
        if (baseParts.length > 1) {
          const secondPart = baseParts[1];
          const imageParts = secondPart.split('/');
          if (imageParts.length > 2) {
            // Reconstruir la URL sin los parámetros de tamaño
            return `${baseParts[0]}/media/${imageParts[0]}/${imageParts[1]}`;
          }
        }
      }
      return imageUrl;
    }
    
    // Para imágenes de Wikipedia/Wikimedia
    if (imageUrl.includes('upload.wikimedia.org')) {
      // Muchas veces incluyen /thumb/ en la ruta - esto suele indicar una versión reducida
      if (imageUrl.includes('/thumb/')) {
        // Intentar obtener la versión original
        const thumbIndex = imageUrl.indexOf('/thumb/');
        const lastSlash = imageUrl.lastIndexOf('/');
        if (thumbIndex !== -1 && lastSlash > thumbIndex) {
          // Eliminar la última parte (parámetro de tamaño) y quitar "/thumb" de la ruta
          return imageUrl.substring(0, lastSlash).replace('/thumb/', '/');
        }
      }
      return imageUrl;
    }
    
    // Para imágenes de Steam
    if (imageUrl.includes('steamstatic.com') || imageUrl.includes('steamcontent.com')) {
      // Verificar si hay parámetros que limitan el tamaño
      if (imageUrl.includes('?')) {
        // Quitar parámetros que podrían estar limitando la calidad
        return imageUrl.split('?')[0];
      }
      return imageUrl;
    }
    
    // Para cualquier otra URL, devolver tal cual
    return imageUrl;
  }

  // Manejar errores de carga de imágenes
  handleImageError(event: any) {
    // Determinar el tipo de imagen basado en las clases del elemento o contenedor padre
    const isBanner = event.target.classList.contains('game-image') || 
                   event.target.parentElement?.classList.contains('game-banner');
    const isCover = event.target.parentElement?.classList.contains('game-cover');
    
    if (isBanner) {
      // Para imagen de banner/hero, usar una imagen de alta calidad
      event.target.src = 'https://via.placeholder.com/1200x600?text=Imagen+De+Alta+Calidad';
    } else if (isCover) {
      // Para imagen de portada/cover, usar una imagen cuadrada
      event.target.src = 'https://via.placeholder.com/600x900?text=Portada+Del+Juego';
    } else {
      // Para otras imágenes, usar una genérica
      event.target.src = 'https://via.placeholder.com/400x400?text=Juego+No+Disponible';
    }
    
    // Añadir clase para estilos específicos en imágenes de fallback
    event.target.classList.add('image-fallback');
  }

  // Generar un array de estrellas llenas basado en la calificación
  getRatingStars(rating: number): number[] {
    if (!rating) return [];
    const fullStars = Math.floor(rating);
    return Array(fullStars).fill(0).map((_, i) => i);
  }

  // Generar un array de estrellas vacías para completar 5 estrellas
  getEmptyStars(rating: number): number[] {
    if (!rating) return Array(5).fill(0).map((_, i) => i);
    const emptyStars = 5 - Math.floor(rating);
    return Array(emptyStars).fill(0).map((_, i) => i);
  }

  // Agregar al carrito
  addToCart() {
    if (this.game) {
      this.ngZone.run(() => {
        this.cartService.addToCart(this.game!.id).subscribe({
          next: () => {
            // Asegurarse de que el toast se muestra usando NgZone
            this.ngZone.run(() => {
              this.toastService.showSuccess('Juego agregado al carrito');
            });
          },
          error: (error) => {
            console.error('Error al agregar al carrito:', error);
            this.ngZone.run(() => {
              this.toastService.showError('Error al agregar el juego al carrito');
            });
          }
        });
      });
    }
  }

  // Formatear precio para mostrar con separador de miles
  formatPrice(price: number): string {
    if (!price) {
      return '0';
    }
    
    // Formatear con punto para miles
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  updateSearchTerm(term: string) {
    this.searchTerm = term;
    if (term && term.trim() !== '') {
      // Navegar al home con el término de búsqueda como parámetro de query
      this.router.navigate(['/home'], { queryParams: { search: term } });
    }
  }

  openSearchModal() {
    this.isSearchModalOpen = true;
  }

  closeSearchModal() {
    this.isSearchModalOpen = false;
  }
} 
