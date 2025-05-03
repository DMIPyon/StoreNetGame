import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '../../services/game.service';
import { Game } from '../../interfaces/game.interface';
import { HttpClientModule } from '@angular/common/http';
import { NgZone } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { WishlistService } from '../../services/wishlist.service';
import { StarRatingComponent } from '../../components/star-rating/star-rating.component';

@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.page.html',
  styleUrls: ['./game-details.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule, StarRatingComponent]
})
export class GameDetailsPage implements OnInit {
  game: Game | null = null;
  isLoading = true;
  cartItemCount = 0;
  isInWishlist = false;

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private ngZone: NgZone,
    private cartService: CartService,
    private toastService: ToastService,
    private wishlistService: WishlistService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGameDetails(Number(id));
    }
    // Cargar el contador del carrito
    this.loadCartItemCount();
  }
  
  ionViewWillEnter() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.checkWishlistStatus(Number(id));
    }
  }
  
  // Método para cargar el contador del carrito
  loadCartItemCount() {
    this.cartService.getCartItemCount().subscribe(count => {
      this.cartItemCount = count;
    });
  }

  loadGameDetails(id: number) {
    this.isLoading = true;
    this.gameService.getGameById(id).subscribe({
      next: (game) => {
        this.game = game;
        
        // Limpiar y asignar descripción en español si es necesario
        if (this.game && (!this.game.description || 
            this.game.description.includes('WARNING') || 
            this.game.description.includes('explicit') || 
            this.game.description.includes('nudity') ||
            this.game.description.includes('Languages:'))) {
          
          // Asignar descripción genérica en español
          this.game.description = 'Un emocionante juego que ofrece una experiencia única para los jugadores. Con gráficos impresionantes y una jugabilidad cautivadora, este título promete horas de entretenimiento para todo tipo de gamers.';
        }
        
        this.isLoading = false;
        
        // Verificar si está en la lista de deseos
        this.checkWishlistStatus(id);
      },
      error: (error) => {
        console.error('Error al cargar los detalles del juego:', error);
        this.isLoading = false;
      }
    });
  }

  addToCart() {
    if (this.game) {
      this.ngZone.run(() => {
        this.cartService.addToCart(this.game!.id).subscribe({
          next: () => {
            // Asegurarse de que el toast se muestra usando NgZone
            this.ngZone.run(() => {
              this.toastService.showSuccess('Juego agregado al carrito');
              
              // Animar el badge del carrito
              const badge = document.querySelector('ion-badge');
              if (badge) {
                badge.classList.remove('cart-badge-animation');
                // Forzar reflow para reiniciar la animación
                void badge.offsetWidth;
                badge.classList.add('cart-badge-animation');
              }
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
  
  // Verificar si el juego está en la lista de deseos
  checkWishlistStatus(gameId: number) {
    if (gameId) {
      this.wishlistService.isInWishlist(gameId).subscribe(isInWishlist => {
        this.isInWishlist = isInWishlist;
      });
    }
  }
  
  // Alternar añadir/quitar de la lista de deseos
  toggleWishlist() {
    if (!this.game) return;
    
    if (this.isInWishlist) {
      this.wishlistService.removeFromWishlist(this.game.id).subscribe(() => {
        this.isInWishlist = false;
      });
    } else {
      this.wishlistService.addToWishlist(this.game).subscribe(() => {
        this.isInWishlist = true;
      });
    }
  }
} 