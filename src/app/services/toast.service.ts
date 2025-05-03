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
  async showSuccess(message: string, duration: number = 2000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom',
      icon: 'checkmark-circle-outline',
      color: 'success'
    });
    
    await toast.present();
  }

  /**
   * Muestra un mensaje de error
   */
  async showError(message: string, duration: number = 3000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom',
      icon: 'alert-circle-outline',
      color: 'danger',
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
   * Muestra un mensaje de advertencia
   */
  async showWarning(message: string, duration?: number) {
    await this.showToast(message, duration, 'bottom', 'warning');
  }

  /**
   * Muestra un toast informativo
   */
  async showInfo(message: string, duration: number = 2000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom',
      icon: 'information-circle-outline',
      color: 'medium'
    });
    
    await toast.present();
  }

  /**
   * Muestra un toast con botones personalizados
   */
  async showToastWithButtons(
    message: string,
    buttons: any[],
    duration: number = 4000
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom',
      buttons
    });
    
    await toast.present();
  }
} 