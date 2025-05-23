import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CartService } from '../services/cart.service';
import { CartItem } from '../interfaces/cart-item';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { FormatClpPipe } from '../pipes/format-clp.pipe';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  imports: [CommonModule, IonicModule, RouterModule, FormatClpPipe]
})
export class CartPage implements OnInit {
  cartItems: CartItem[] = [];
  isAuthenticated = false;
  isProcessing = false;
  
  constructor(
    private cartService: CartService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCart();
    // Escuchar cambios en el carrito
    this.cartService.cart$.subscribe(cart => {
      if (cart) {
        this.cartItems = cart.items;
      }
    });
    
    // Verificar si el usuario está autenticado
    this.isAuthenticated = this.authService.isAuthenticated;
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  loadCart() {
    this.cartService.loadCart().subscribe(cart => {
      if (cart) {
        this.cartItems = cart.items;
      }
    });
  }

  updateQuantity(item: CartItem, change: number) {
    const newQuantity = item.quantity + change;
    if (newQuantity < 1) return;
    
    this.cartService.updateCartItem(item.id, newQuantity).subscribe();
    this.presentToast(`Cantidad actualizada: ${item.title} (${newQuantity})`);
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.id).subscribe();
    this.presentToast(`${item.title} eliminado del carrito`);
  }

  clearCart() {
    this.presentAlert(
      'Vaciar carrito',
      '¿Estás seguro de que deseas vaciar tu carrito?',
      [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Vaciar',
          handler: () => {
            this.cartService.clearCart().subscribe();
            this.presentToast('Carrito vaciado');
          }
        }
      ]
    );
  }

  getSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getVAT(): number {
    return this.getSubtotal() * 0.19;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getVAT();
  }

  async presentAlert(header: string, message: string, buttons: any[]) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons,
      cssClass: 'custom-alert'
    });
    await alert.present();
  }

  async presentToast(message: string) {
    let cssClass = 'cart-toast';
    let header = '';
    let content = message;
    
    // Verificar si es un mensaje de actualización de cantidad
    if (message.includes('Cantidad actualizada:')) {
      cssClass = 'cart-toast quantity-updated-toast';
      
      // Extraer el nombre del producto y la cantidad
      const match = message.match(/Cantidad actualizada: (.*) \((\d+)\)/);
      if (match) {
        const productName = match[1];
        const quantity = match[2];
        header = productName;
        content = `Cantidad: ${quantity}`;
      }
    }
    
    const toast = await this.toastController.create({
      header: header,
      message: content,
      duration: 2000,
      position: 'bottom',
      color: message.includes('eliminado') ? 'danger' : undefined,
      cssClass: cssClass,
      buttons: [
        {
          icon: message.includes('eliminado') ? 'close-circle' : 'checkmark-circle',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  async checkoutCart() {
    if (this.isProcessing) return;
    
    // Verificar si el usuario está autenticado
    if (!this.isAuthenticated) {
      this.presentAuthAlert();
      return;
    }
    
    // Procesar la compra
    this.isProcessing = true;
    
    // Mostrar indicador de proceso
    const loadingToast = await this.toastController.create({
      message: 'Procesando tu compra...',
      duration: 0,
      position: 'middle',
      cssClass: 'processing-toast'
    });
    await loadingToast.present();
    
    // Aquí iría la lógica para procesar la compra
    setTimeout(async () => {
      this.isProcessing = false;
      await loadingToast.dismiss();
      this.router.navigate(['/checkout-success']);
    }, 2000);
  }
  
  async presentAuthAlert() {
    const alert = await this.alertController.create({
      header: 'Iniciar sesión requerido',
      message: 'Debes iniciar sesión para completar la compra',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Iniciar sesión',
          handler: () => {
            this.router.navigate(['/login'], { 
              queryParams: { returnUrl: '/cart' } 
            });
          }
        }
      ],
      cssClass: 'auth-alert'
    });
    await alert.present();
  }
} 