import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor() {}

  // Mostrar notificación personalizada
  showNotification(header: string, message: string) {
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
        <div class="notification-header">${header}</div>
        <div class="notification-message">${message}</div>
        <div class="notification-icon">
          <ion-icon name="checkmark-circle"></ion-icon>
        </div>
      </div>
    `;
    
    // Añadir al body
    document.body.appendChild(notification);
    
    // Eliminar después de 2.5 segundos
    setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 2500);
  }
} 