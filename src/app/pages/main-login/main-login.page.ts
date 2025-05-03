import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-main-login',
  templateUrl: './main-login.page.html',
  styleUrls: ['./main-login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterModule]
})
export class MainLoginPage implements OnInit {
  loginForm: FormGroup;
  isLoading: boolean = false;
  showPassword: boolean = false;
  loginError: string = '';
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    // Inicializar formulario
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Si el usuario ya está autenticado, redirigir a la página principal
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/home']);
    }
  }

  // Obtener controles del formulario para validaciones
  get f() {
    return this.loginForm.controls;
  }

  // Mostrar/ocultar contraseña
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Manejar envío del formulario
  onSubmit() {
    // Marcar todos los campos como tocados para mostrar errores
    this.loginForm.markAllAsTouched();
    
    if (this.loginForm.invalid) {
      this.presentToast('Por favor, ingrese un correo y contraseña válidos');
      return;
    }
    
    this.isLoading = true;
    this.loginError = '';
    
    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };
    
    this.authService.login(credentials)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.presentToast('¡Bienvenido!', 'success');
            this.router.navigate(['/home']);
          } else {
            this.loginError = response.message;
            this.presentToast(response.message || 'Credenciales inválidas', 'danger');
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.loginError = 'Error en el servidor. Intente más tarde.';
          this.presentToast('Error en el servidor. Intente más tarde.', 'danger');
          console.error('Login error:', error);
        }
      });
  }

  forgotPassword() {
    // Implementar lógica para recuperar contraseña
    this.presentToast('Función de recuperación de contraseña próximamente');
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
  
  // Mostrar mensaje toast
  async presentToast(message: string, color: string = 'dark') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }
} 