import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  createdAt: Date;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  data?: User;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  // BehaviorSubject para mantener el estado de autenticación
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // BehaviorSubject para el estado de carga
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) {
    // Cargar usuario del localStorage al iniciar
    this.loadUserFromStorage();
  }

  /**
   * Cargar usuario guardado en localStorage
   */
  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        // console.error('Error parsing stored user:', error);
        this.logout();
      }
    }
  }

  /**
   * Obtener usuario actual
   */
  public get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  public get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value && !!localStorage.getItem('token');
  }

  /**
   * Obtener token JWT
   */
  public get token(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Verificar si el usuario actual es administrador
   */
  public get isAdmin(): boolean {
    return this.isAuthenticated && this.currentUser?.role === 'admin';
  }

  /**
   * Registrar un nuevo usuario
   */
  register(userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
  }): Observable<AuthResponse> {
    this.loadingSubject.next(true);
    if (userData.password !== userData.confirmPassword) {
      this.toastService.showError('Las contraseñas no coinciden');
      this.loadingSubject.next(false);
      return of({ success: false, message: 'Las contraseñas no coinciden' });
    }
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.handleAuthSuccess(response.data);
            this.toastService.showSuccess('¡Registro exitoso!');
          }
        }),
        catchError(error => {
          this.handleAuthError(error);
          return of({
            success: false,
            message: error.error?.message || 'Error durante el registro'
          });
        }),
        tap(() => this.loadingSubject.next(false))
      );
  }

  /**
   * Iniciar sesión
   */
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    this.loadingSubject.next(true);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.handleAuthSuccess(response.data);
            this.toastService.showSuccess('¡Bienvenido de nuevo!');
          }
        }),
        catchError(error => {
          this.handleAuthError(error);
          return of({
            success: false,
            message: error.error?.message || 'Error durante el inicio de sesión'
          });
        }),
        tap(() => this.loadingSubject.next(false))
      );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    // Eliminar datos de autenticación
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    
    // Redireccionar al inicio de sesión
    this.router.navigate(['/login']);
    this.toastService.showInfo('Has cerrado sesión');
  }

  /**
   * Obtener perfil del usuario actual
   */
  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/profile`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            // Actualizar el perfil si ha cambiado
            this.currentUserSubject.next(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          }
          return response;
        }),
        catchError(error => {
          console.error('Error fetching profile:', error);
          if (error.status === 401) {
            // Token expirado o inválido
            this.logout();
          }
          return of({
            success: false,
            message: error.error?.message || 'Error al obtener perfil',
            error: error.message
          });
        })
      );
  }

  /**
   * Actualizar perfil de usuario
   */
  updateProfile(userData: {
    firstName?: string;
    lastName?: string;
    profileImage?: string;
  }): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(`${this.apiUrl}/profile`, userData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            // Actualizar datos del usuario actual
            const updatedUser = {
              ...this.currentUser,
              ...response.data
            };
            this.currentUserSubject.next(updatedUser as User);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            this.toastService.showSuccess('Perfil actualizado con éxito');
          }
          return response;
        }),
        catchError(error => {
          this.toastService.showError(error.error?.message || 'Error al actualizar perfil');
          return of({
            success: false,
            message: error.error?.message || 'Error al actualizar perfil',
            error: error.message
          });
        })
      );
  }

  /**
   * Cambiar contraseña
   */
  changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, passwordData)
      .pipe(
        map(response => {
          if (response.success) {
            this.toastService.showSuccess('Contraseña actualizada con éxito');
            return true;
          }
          return false;
        }),
        catchError(error => {
          this.toastService.showError(error.error?.message || 'Error al cambiar la contraseña');
          return of(false);
        })
      );
  }

  /**
   * Manejar respuesta exitosa de autenticación
   */
  private handleAuthSuccess(data: { user: any, token: string }) {
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    // Si tienes lógica para guardar el usuario actual, mantenla aquí
    if (data.user) {
      this.currentUserSubject.next(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  }

  /**
   * Manejar error de autenticación
   */
  private handleAuthError(error: any): void {
    // console.error('Auth error:', error);
    this.toastService.showError(
      error.error?.message || 'Ha ocurrido un error de autenticación'
    );
  }
} 