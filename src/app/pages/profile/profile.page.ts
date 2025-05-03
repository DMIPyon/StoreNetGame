import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService, User } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class ProfilePage implements OnInit {
  profileForm!: FormGroup;
  isLoading = false;
  currentUser: User | null = null;
  isAdmin = false;
  
  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.isLoading = true;
    
    // Obtener información del usuario actual
    this.authService.getProfile().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentUser = response.data;
          this.isAdmin = this.currentUser?.role === 'admin';
          this.initForm();
        } else {
          this.presentToast(response.message || 'Error al cargar perfil', 'danger');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el perfil:', error);
        this.isLoading = false;
        this.presentToast('Error al cargar el perfil. Intente nuevamente.', 'danger');
      }
    });
  }

  initForm() {
    this.profileForm = this.formBuilder.group({
      username: [this.currentUser?.username, [Validators.required, Validators.minLength(3)]],
      email: [this.currentUser?.email, [Validators.required, Validators.email]],
      firstName: [this.currentUser?.firstName || ''],
      lastName: [this.currentUser?.lastName || ''],
      profileImage: [this.currentUser?.profileImage || '']
    });
  }

  updateProfile() {
    if (this.profileForm.invalid) {
      this.presentToast('Por favor, complete correctamente todos los campos obligatorios', 'warning');
      return;
    }

    this.isLoading = true;
    
    const profileData = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      profileImage: this.profileForm.value.profileImage
    };

    this.authService.updateProfile(profileData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.presentToast('Perfil actualizado correctamente', 'success');
          if (response.data) {
            this.currentUser = response.data;
          }
        } else {
          this.presentToast(response.message || 'Error al actualizar el perfil', 'danger');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al actualizar perfil:', error);
        this.presentToast('Error al actualizar el perfil. Intente nuevamente.', 'danger');
      }
    });
  }

  goToAdminPanel() {
    this.router.navigate(['/admin']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
} 