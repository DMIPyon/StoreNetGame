import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { AnimationController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

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
  isAuthenticated = false;
  
  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
    private animationCtrl: AnimationController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });
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
    let email = '';

    if (!this.isAuthenticated) {
      const alert = await this.alertController.create({
        header: 'Correo electrónico requerido',
        message: 'Necesitamos tu correo para enviarte el recibo y el código del producto.',
        inputs: [
          {
            name: 'email',
            type: 'email',
            placeholder: 'tu@email.com'
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Continuar',
            handler: (data) => {
              email = data.email;
              if (!email || !this.validateEmail(email)) {
                this.toastController.create({
                  message: 'Por favor ingresa un correo válido.',
                  duration: 2000,
                  color: 'danger'
                }).then(toast => toast.present());
                return false;
              }
              this.iniciarPagoWebpay(email);
              return true;
            }
          }
        ]
      });
      await alert.present();
      return;
    }

    email = this.authService.currentUser?.email || '';
    this.iniciarPagoWebpay(email);
  }

  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  iniciarPagoWebpay(email: string) {
    const amount = this.getTotal();
    this.http.post<any>('http://localhost:3000/api/payment/webpay', { email, amount }).subscribe({
      next: (response) => {
        // Redirige a Webpay
        window.location.href = `${response.url}?token_ws=${response.token}`;
      },
      error: () => {
        this.toastController.create({
          message: 'Error al iniciar el pago con Webpay',
          duration: 3000,
          color: 'danger'
        }).then(toast => toast.present());
      }
    });
  }
} 