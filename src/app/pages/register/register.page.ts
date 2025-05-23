import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterModule]
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;
  registerError: string = '';
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    // Inicializar formulario con validaciones
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      firstName: [''],
      lastName: [''],
      acceptTerms: [false, Validators.requiredTrue]
    }, { 
      validators: this.passwordMatchValidator
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
    return this.registerForm.controls;
  }

  // Validador personalizado para confirmar contraseña
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
      return null;
    }
  }

  // Mostrar/ocultar contraseña
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Mostrar/ocultar confirmar contraseña
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Manejar envío del formulario
  onSubmit() {
    // Marcar todos los campos como tocados para mostrar errores
    this.registerForm.markAllAsTouched();
    
    if (this.registerForm.invalid) {
      this.presentToast('Por favor, complete todos los campos correctamente');
      return;
    }
    
    this.isLoading = true;
    this.registerError = '';
    
    const userData = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      confirmPassword: this.registerForm.value.confirmPassword,
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName
    };
    
    this.authService.register(userData)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.presentToast('¡Registro exitoso!', 'success');
            this.router.navigate(['/home']);
          } else {
            this.registerError = response.message;
            this.presentToast(response.message || 'Error en el registro', 'danger');
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.registerError = 'Error en el servidor. Intente más tarde.';
          this.presentToast('Error en el servidor. Intente más tarde.', 'danger');
          console.error('Register error:', error);
        }
      });
  }

  // Ir a la página de inicio de sesión
  navigateToLogin() {
    this.router.navigate(['/main-login']);
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