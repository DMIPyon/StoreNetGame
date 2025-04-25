import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  /**
   * Muestra una notificación estándar
   * @param header El título de la notificación
   * @param message El mensaje de la notificación
   * @param duration Duración en milisegundos
   * @param position Posición de la notificación ('top', 'middle', 'bottom')
   */
  async showToast(header: string, message: string, duration: number = 2500, position: 'top' | 'middle' | 'bottom' = 'bottom'): Promise<void> {
    const toast = await this.toastController.create({
      header,
      message,
      duration,
      position,
      cssClass: 'cart-toast',
      buttons: [
        {
          icon: 'checkmark-circle',
          role: 'cancel'
        }
      ]
    });
    
    await toast.present();
  }
  
  /**
   * Muestra una notificación para productos agregados al carrito
   * @param productName Nombre del producto
   */
  async showProductAddedToast(productName: string): Promise<void> {
    await this.showToast(
      productName,
      'Añadido al carrito',
      2500,
      'bottom'
    );
  }

  /**
   * Muestra una notificación personalizada en la interfaz sin usar el ToastController
   * @param title Título de la notificación
   * @param message Mensaje de la notificación
   * @param duration Duración en milisegundos
   */
  showCustomNotification(title: string, message: string, duration: number = 2500): void {
    // Eliminar notificación anterior si existe
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-header">${title}</div>
        <div class="notification-message">${message}</div>
        <div class="notification-icon">
          <ion-icon name="checkmark-circle"></ion-icon>
        </div>
      </div>
    `;
    
    // Añadir al body
    document.body.appendChild(notification);
    
    // Eliminar después de la duración especificada
    setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, duration);
  }
} 