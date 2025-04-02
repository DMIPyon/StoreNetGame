import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CartService } from '../services/cart.service';
import { CartItem } from '../interfaces/cart-item';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { FormatClpPipe } from '../pipes/format-clp.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  imports: [CommonModule, IonicModule, RouterModule, FormatClpPipe]
})
export class CartPage implements OnInit {
  cartItems: CartItem[] = [];
  
  constructor(
    private cartService: CartService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadCart();
    // Escuchar cambios en el carrito
    this.cartService.getCartItems().subscribe((items: CartItem[]) => {
      this.cartItems = items;
    });
  }

  loadCart() {
    this.cartService.getCartItems().subscribe((items: CartItem[]) => {
      this.cartItems = items;
    });
  }

  updateQuantity(item: CartItem, change: number) {
    const newQuantity = item.quantity + change;
    if (newQuantity < 1) return;
    
    this.cartService.updateQuantity(item, newQuantity);
    this.presentToast(`Cantidad actualizada: ${item.name} (${newQuantity})`);
  }

  removeItem(item: CartItem) {
    this.cartService.removeItem(item);
    this.presentToast(`${item.name} eliminado del carrito`);
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
            this.cartService.clearCart();
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
} 