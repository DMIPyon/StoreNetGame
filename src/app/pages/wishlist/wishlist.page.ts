import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { WishlistService, WishlistItem } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { FormatClpPipe } from '../../pipes/format-clp.pipe';
import { StarRatingComponent } from '../../components/star-rating/star-rating.component';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.page.html',
  styleUrls: ['./wishlist.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonicModule, 
    FormsModule, 
    RouterModule,
    FormatClpPipe,
    StarRatingComponent
  ]
})
export class WishlistPage implements OnInit {
  wishlistItems: WishlistItem[] = [];
  filteredItems: WishlistItem[] = [];
  isLoading = true;
  cartItemCount = 0;
  sortBy: 'default' | 'price-asc' | 'price-desc' | 'rating-desc' = 'default';
  
  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadWishlist();
    
    // Suscribirse al contador del carrito
    this.cartService.getCartItemCount().subscribe(count => {
      this.cartItemCount = count;
    });
  }

  ionViewWillEnter() {
    this.loadWishlist();
  }

  loadWishlist() {
    this.isLoading = true;
    this.wishlistService.getWishlistItems().subscribe(items => {
      this.wishlistItems = items;
      this.applySort();
      this.isLoading = false;
    });
  }

  viewGameDetails(gameId: number) {
    this.router.navigate(['/game-details', gameId]);
  }

  removeFromWishlist(gameId: number, event: Event) {
    event.stopPropagation();
    this.wishlistService.removeFromWishlist(gameId).subscribe(() => {
      // Actualizar la lista local después de eliminar
      this.wishlistItems = this.wishlistItems.filter(item => item.game_id !== gameId);
      this.applySort();
    });
  }

  addToCart(gameId: number, event: Event) {
    event.stopPropagation();
    
    // Animar el badge del carrito
    const badge = document.querySelector('ion-badge');
    if (badge) {
      badge.classList.remove('cart-badge-animation');
      // Forzar reflow para reiniciar la animación
      void badge.offsetWidth;
      badge.classList.add('cart-badge-animation');
    }
    
    this.cartService.addToCart(gameId).subscribe({
      next: () => {
        this.toastController.create({
          message: 'Juego agregado al carrito',
          duration: 2000,
          position: 'bottom',
          color: 'success',
          icon: 'checkmark-circle-outline'
        }).then(toast => toast.present());
        
        // Eliminar de la lista de deseos al añadir al carrito
        this.wishlistService.removeFromWishlist(gameId).subscribe(() => {
          // Actualizar la lista local después de eliminar
          this.wishlistItems = this.wishlistItems.filter(item => item.game_id !== gameId);
          this.applySort();
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
  
  async clearWishlist() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas vaciar tu lista de deseos?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.wishlistService.clearWishlist().subscribe(() => {
              this.wishlistItems = [];
              this.filteredItems = [];
            });
          }
        }
      ]
    });
    
    await alert.present();
  }
  
  async presentSortOptions() {
    const alert = await this.alertController.create({
      header: 'Ordenar por',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ],
      inputs: [
        {
          label: 'Por defecto',
          type: 'radio',
          value: 'default',
          checked: this.sortBy === 'default'
        },
        {
          label: 'Menor precio',
          type: 'radio',
          value: 'price-asc',
          checked: this.sortBy === 'price-asc'
        },
        {
          label: 'Mayor precio',
          type: 'radio',
          value: 'price-desc',
          checked: this.sortBy === 'price-desc'
        },
        {
          label: 'Mejor calificación',
          type: 'radio',
          value: 'rating-desc',
          checked: this.sortBy === 'rating-desc'
        }
      ]
    });
    
    await alert.present();
    
    const { data } = await alert.onDidDismiss();
    if (data?.values) {
      this.sortBy = data.values;
      this.applySort();
    }
  }
  
  applySort() {
    // Crear una copia de los items para ordenar
    this.filteredItems = [...this.wishlistItems];
    
    switch (this.sortBy) {
      case 'price-asc':
        this.filteredItems.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.filteredItems.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        this.filteredItems.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        });
        break;
      default:
        // Mantener el orden original
        break;
    }
  }
  
  addAllToCart() {
    if (this.wishlistItems.length === 0) return;
    
    // Mostrar indicador de carga
    this.isLoading = true;
    
    // Crear un array de promesas para añadir cada juego al carrito
    const promises = this.wishlistItems.map(item => {
      return new Promise<void>((resolve) => {
        this.cartService.addToCart(item.game_id).subscribe({
          next: () => resolve(),
          error: () => resolve() // Resolver incluso en caso de error para continuar
        });
      });
    });
    
    // Esperar a que todas las promesas se resuelvan
    Promise.all(promises).then(() => {
      this.toastController.create({
        message: 'Todos los juegos han sido agregados al carrito',
        duration: 3000,
        position: 'bottom',
        color: 'success',
        icon: 'checkmark-circle-outline'
      }).then(toast => toast.present());
      
      // Vaciar la lista de deseos
      this.wishlistService.clearWishlist().subscribe(() => {
        this.wishlistItems = [];
        this.filteredItems = [];
        this.isLoading = false;
      });
    });
  }
} 