import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton,
  IonItem, IonLabel, IonText, IonSpinner, IonCard, IonCardContent, 
  IonRow, IonCol, IonImg, IonIcon
} from '@ionic/angular/standalone';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { take } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import { 
  mailOutline, lockClosedOutline, logInOutline, personAddOutline, eyeOutline, eyeOffOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-main-login',
  templateUrl: './main-login.page.html',
  styleUrls: ['./main-login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton,
    IonItem, IonLabel, IonText, IonSpinner, IonCard, IonCardContent,
    IonRow, IonCol, IonImg, IonIcon
  ]
})
export class MainLoginPage implements OnInit {
  loginForm: FormGroup;
  isLoading: boolean = false;
  showPassword: boolean = false;
  loginError: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({
      mailOutline, lockClosedOutline, logInOutline, personAddOutline, eyeOutline, eyeOffOutline
    });
    
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
            this.router.navigate(['/home']);
          } else {
            this.loginError = response.message;
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.loginError = 'Error en el servidor. Intente más tarde.';
          console.error('Login error:', error);
        }
      });
  }

  // Ir a la página de registro
  goToRegister() {
    this.router.navigate(['/register']);
  }
}
