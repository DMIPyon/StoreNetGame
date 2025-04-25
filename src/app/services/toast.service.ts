import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  /**
   * Muestra un mensaje toast
   * @param message El mensaje a mostrar
   * @param duration Duración en milisegundos (por defecto 2000ms)
   * @param position Posición del toast ('top', 'middle', 'bottom')
   * @param color Color del toast ('success', 'warning', 'danger', etc.)
   */
  async showToast(
    message: string, 
    duration: number = 2000,
    position: 'top' | 'middle' | 'bottom' = 'bottom',
    color: string = 'primary'
  ) {
    const toast = await this.toastController.create({
      message,
      duration,
      position,
      color,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }

  /**
   * Muestra un mensaje de éxito
   */
  async showSuccess(message: string, duration?: number) {
    await this.showToast(message, duration, 'bottom', 'success');
  }

  /**
   * Muestra un mensaje de error
   */
  async showError(message: string, duration?: number) {
    await this.showToast(message, duration, 'bottom', 'danger');
  }

  /**
   * Muestra un mensaje de advertencia
   */
  async showWarning(message: string, duration?: number) {
    await this.showToast(message, duration, 'bottom', 'warning');
  }
} 