import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton,
  IonItem, IonLabel, IonText, IonSpinner, IonCard, IonCardContent, 
  IonRow, IonCol, IonIcon, IonBackButton, IonButtons
} from '@ionic/angular/standalone';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { take } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import { 
  mailOutline, lockClosedOutline, personOutline, chevronBackOutline,
  eyeOutline, eyeOffOutline, personAddOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton,
    IonItem, IonLabel, IonText, IonSpinner, IonCard, IonCardContent,
    IonRow, IonCol, IonIcon, IonBackButton, IonButtons
  ]
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  isLoading: boolean = false;
  showPassword: boolean = false;
  registerError: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({
      mailOutline, lockClosedOutline, personOutline, chevronBackOutline,
      eyeOutline, eyeOffOutline, personAddOutline
    });
    
    // Inicializar formulario
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      firstName: [''],
      lastName: ['']
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

  // Manejar envío del formulario
  onSubmit() {
    // Marcar todos los campos como tocados para mostrar errores
    this.registerForm.markAllAsTouched();
    
    if (this.registerForm.invalid) {
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
            this.router.navigate(['/home']);
          } else {
            this.registerError = response.message;
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.registerError = 'Error en el servidor. Intente más tarde.';
          console.error('Register error:', error);
        }
      });
  }

  // Ir a la página de inicio de sesión
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
