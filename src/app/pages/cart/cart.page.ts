import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class CartPage implements OnInit {
  cartItems: CartItem[] = [];
  isUpdating = false;
  
  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
    private animationCtrl: AnimationController
  ) {}

  ngOnInit() {
    this.loadCart();
  }
  
  ionViewWillEnter() {
    this.loadCart();
  }
  
  loadCart() {
    this.cartService.cart$.subscribe(cart => {
      this.cartItems = cart?.items || [];
    });
  }

  async confirmRemoveItem(item: CartItem) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro que deseas eliminar "${item.title}" de tu carrito?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'confirm',
          handler: () => {
            this.removeItem(item);
          }
        }
      ]
    });

    await alert.present();
  }

  removeItem(item: CartItem) {
    const itemCard = document.querySelector(`.cart-item[data-id="${item.id}"]`) as HTMLElement;
    if (itemCard) {
      // Animación de desvanecimiento
      const animation = this.animationCtrl.create()
        .addElement(itemCard)
        .duration(300)
        .easing('ease-out')
        .fromTo('opacity', '1', '0')
        .fromTo('transform', 'translateX(0)', 'translateX(-100%)');
      
      animation.play().then(() => {
        this.cartService.removeFromCart(item.id).subscribe();
      });
    } else {
      this.cartService.removeFromCart(item.id).subscribe();
    }
  }

  increaseQuantity(item: CartItem) {
    if (this.isUpdating) return;
    this.isUpdating = true;
    
    item.quantity += 1;
    this.cartService.updateCartItem(item.id, item.quantity).subscribe({
      next: () => {
        this.isUpdating = false;
        this.animateQuantityChange('+1');
      },
      error: () => {
        item.quantity -= 1; // Revertir el cambio si hay error
        this.isUpdating = false;
      }
    });
  }

  decreaseQuantity(item: CartItem) {
    if (this.isUpdating || item.quantity <= 1) return;
    this.isUpdating = true;
    
    item.quantity -= 1;
    this.cartService.updateCartItem(item.id, item.quantity).subscribe({
      next: () => {
        this.isUpdating = false;
        this.animateQuantityChange('-1');
      },
      error: () => {
        item.quantity += 1; // Revertir el cambio si hay error
        this.isUpdating = false;
      }
    });
  }
  
  animateQuantityChange(text: string) {
    // Implementación opcional de una animación visual
    // para feedback cuando se cambia la cantidad
  }

  viewGameDetails(gameId: number) {
    this.router.navigate(['/game-details', gameId]);
  }

  async confirmClearCart() {
    const alert = await this.alertController.create({
      header: 'Vaciar carrito',
      message: '¿Estás seguro que deseas eliminar todos los productos de tu carrito?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Vaciar',
          role: 'confirm',
          handler: () => {
            this.clearCart();
          }
        }
      ]
    });

    await alert.present();
  }

  clearCart() {
    this.cartService.clearCart().subscribe({
      next: () => {
        this.toastController.create({
          message: 'Carrito vaciado correctamente',
          duration: 2000,
          position: 'bottom',
          color: 'success'
        }).then(toast => toast.present());
      }
    });
  }

  getSubtotal() {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getIVA() {
    return this.getSubtotal() * 0.19;
  }

  getTotal() {
    return this.getSubtotal() + this.getIVA();
  }

  async checkout() {
    if (!this.authService.isAuthenticated) {
      const toast = await this.toastController.create({
        message: 'Debes iniciar sesión para completar la compra',
        duration: 2000,
        color: 'warning',
        position: 'bottom',
        buttons: [
          {
            text: 'Iniciar sesión',
            role: 'cancel',
            handler: () => {
              this.router.navigate(['/main-login']);
            }
          }
        ]
      });
      await toast.present();
      return;
    }
    
    // Mostrar un loader durante el procesamiento
    const loading = await this.alertController.create({
      header: 'Procesando...',
      message: 'Estamos procesando tu compra',
      backdropDismiss: false
    });
    await loading.present();
    
    // Simulamos un tiempo de procesamiento
    setTimeout(async () => {
      await loading.dismiss();
      
      // Aquí iría la lógica real de compra
      const toast = await this.toastController.create({
        message: '¡Compra realizada con éxito!',
        duration: 3000,
        color: 'success',
        position: 'middle',
        buttons: [
          {
            text: 'Ver mis compras',
            handler: () => {
              // Navegación a una hipotética página de "mis compras"
              // this.router.navigate(['/my-orders']);
            }
          }
        ]
      });
      await toast.present();
      
      // Limpiar el carrito después de la compra
      this.cartService.clearCart().subscribe();
    }, 2000);
  }
} 