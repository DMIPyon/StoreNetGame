import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';

export interface CartItem {
  id: number;
  game_id: number;
  quantity: number;
  title: string;
  price: number;
  image_url: string;
  itemTotal: number;
  discount?: number;
  original_price?: number;
}

export interface Cart {
  cartId: number;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  
  // BehaviorSubject para mantener el estado del carrito
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();
  
  // BehaviorSubject para el estado de carga
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private authService: AuthService
  ) {
    // Si el usuario está autenticado, cargar el carrito al iniciar
    if (this.authService.isAuthenticated) {
      this.loadCart();
    }
    
    // Suscribirse a cambios en la autenticación
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadCart();
      } else {
        this.cartSubject.next(null);
      }
    });
  }

  /**
   * Obtener el estado actual del carrito
   */
  public get cart(): Cart | null {
    return this.cartSubject.value;
  }

  /**
   * Obtener el número total de items en el carrito
   */
  public get itemCount(): number {
    return this.cart?.itemCount || 0;
  }

  /**
   * Obtener un Observable con el conteo de items en el carrito
   */
  getCartItemCount(): Observable<number> {
    return this.cart$.pipe(
      map(cart => cart?.itemCount || 0)
    );
  }

  /**
   * Cargar el carrito del usuario desde el servidor
   */
  loadCart(): Observable<Cart> {
    this.loadingSubject.next(true);
    
    return this.http.get<any>(this.apiUrl)
      .pipe(
        map(response => {
          if (response.success) {
            this.cartSubject.next(response.data);
            return response.data;
          } else {
            throw new Error(response.message || 'Error al cargar el carrito');
          }
        }),
        catchError(error => {
          console.error('Error cargando carrito:', error);
          return throwError(() => error);
        }),
        tap(() => this.loadingSubject.next(false))
      );
  }

  /**
   * Añadir un item al carrito
   */
  addToCart(gameId: number, quantity: number = 1): Observable<any> {
    this.loadingSubject.next(true);
    
    return this.http.post<any>(`${this.apiUrl}/items`, { gameId, quantity })
      .pipe(
        tap(response => {
          if (response.success) {
            this.toastService.showSuccess('Juego agregado al carrito');
            this.loadCart().subscribe();
          }
        }),
        catchError(error => {
          console.error('Error al añadir al carrito:', error);
          this.toastService.showError(
            error.error?.message || 'Error al agregar al carrito'
          );
          return throwError(() => error);
        }),
        tap(() => this.loadingSubject.next(false))
      );
  }

  /**
   * Actualizar cantidad de un item del carrito
   */
  updateCartItem(itemId: number, quantity: number): Observable<any> {
    this.loadingSubject.next(true);
    
    return this.http.put<any>(`${this.apiUrl}/items/${itemId}`, { quantity })
      .pipe(
        tap(response => {
          if (response.success) {
            this.loadCart().subscribe();
          }
        }),
        catchError(error => {
          console.error('Error al actualizar item:', error);
          this.toastService.showError(
            error.error?.message || 'Error al actualizar cantidad'
          );
          return throwError(() => error);
        }),
        tap(() => this.loadingSubject.next(false))
      );
  }

  /**
   * Eliminar un item del carrito
   */
  removeFromCart(itemId: number): Observable<any> {
    this.loadingSubject.next(true);
    
    return this.http.delete<any>(`${this.apiUrl}/items/${itemId}`)
      .pipe(
        tap(response => {
          if (response.success) {
            this.toastService.showSuccess('Producto eliminado del carrito');
            this.loadCart().subscribe();
          }
        }),
        catchError(error => {
          console.error('Error al eliminar del carrito:', error);
          this.toastService.showError(
            error.error?.message || 'Error al eliminar del carrito'
          );
          return throwError(() => error);
        }),
        tap(() => this.loadingSubject.next(false))
      );
  }

  /**
   * Vaciar el carrito
   */
  clearCart(): Observable<any> {
    this.loadingSubject.next(true);
    
    return this.http.delete<any>(this.apiUrl)
      .pipe(
        tap(response => {
          if (response.success) {
            this.toastService.showSuccess('Carrito vaciado');
            this.cartSubject.next(null);
          }
        }),
        catchError(error => {
          console.error('Error al vaciar carrito:', error);
          this.toastService.showError(
            error.error?.message || 'Error al vaciar el carrito'
          );
          return throwError(() => error);
        }),
        tap(() => this.loadingSubject.next(false))
      );
  }
} 