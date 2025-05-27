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
  cover_url: string;
  discount?: number;
  original_price?: number;
  itemTotal: number;
}

export interface Cart {
  cartId?: number;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private localStorageKey = 'cart_anonymous';
  
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
    // Suscribirse a cambios en la autenticación
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.mergeLocalCartWithBackend();
        this.loadCart().subscribe();
      } else {
        this.loadLocalCart();
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
      map(cart => cart?.items ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0)
    );
  }

  // --- Carrito anónimo (localStorage) ---
  private loadLocalCart() {
    const localCart = localStorage.getItem(this.localStorageKey);
    let cart: Cart = { items: [], totalAmount: 0, itemCount: 0 };
    if (localCart) {
      try {
        cart = JSON.parse(localCart);
      } catch (e) { cart = { items: [], totalAmount: 0, itemCount: 0 }; }
    }
    this.cartSubject.next(cart);
  }

  private saveLocalCart(cart: Cart) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(cart));
    this.cartSubject.next(cart);
  }

  private clearLocalCart() {
    localStorage.removeItem(this.localStorageKey);
    this.cartSubject.next({ items: [], totalAmount: 0, itemCount: 0 });
  }

  // --- Fusión de carritos al login ---
  private mergeLocalCartWithBackend() {
    const localCart = localStorage.getItem(this.localStorageKey);
    if (!localCart) {
      this.loadCart().subscribe();
      return;
    }
    const cart: Cart = JSON.parse(localCart);
    if (cart.items.length === 0) {
      this.loadCart().subscribe();
      return;
    }
    // Añadir todos los items del carrito local al backend
    const addAll = cart.items.map(item =>
      this.http.post<any>(`${this.apiUrl}/items`, { gameId: item.game_id, quantity: item.quantity })
    );
    Promise.all(addAll.map(obs => obs.toPromise())).then(() => {
      this.clearLocalCart();
      this.loadCart().subscribe();
    });
  }

  /**
   * Cargar el carrito del usuario desde el servidor
   */
  loadCart(): Observable<Cart> {
    if (!this.authService.isAuthenticated) {
      this.loadLocalCart();
      return new BehaviorSubject(this.cartSubject.value as Cart).asObservable();
    }
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
          return throwError(() => error);
        }),
        tap(() => this.loadingSubject.next(false))
      );
  }

  /**
   * Añadir un item al carrito
   */
  addToCart(gameId: number, quantity: number = 1): Observable<any> {
    if (!this.authService.isAuthenticated) {
      // Carrito anónimo
      let cart = this.cartSubject.value || { items: [], totalAmount: 0, itemCount: 0 };
      const idx = cart.items.findIndex(i => i.game_id === gameId);
      if (idx > -1) {
        cart.items[idx].quantity += quantity;
        cart.items[idx].itemTotal = cart.items[idx].price * cart.items[idx].quantity;
        this.saveLocalCart(cart);
        return new BehaviorSubject({ success: true }).asObservable();
      } else {
        // Consultar la API de juegos para obtener los datos reales
        return this.http.get<any>(`${environment.apiUrl}/games/${gameId}`).pipe(
          map(response => {
            const game = response.data;
            if (!game) {
              throw new Error('No se encontró el juego');
            }
            const newItem: CartItem = {
              id: Date.now(),
              game_id: gameId,
              quantity,
              title: game.title,
              price: game.price,
              cover_url: game.cover_url,
              discount: game.discount,
              original_price: game.original_price,
              itemTotal: game.price * quantity
            };
            cart.items.push(newItem);
            cart.itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
            cart.totalAmount = cart.items.reduce((sum, i) => sum + i.itemTotal, 0);
            this.saveLocalCart(cart);
            return { success: true };
          })
        );
      }
    }
    // Carrito autenticado
    this.loadingSubject.next(true);
    return this.http.post<any>(`${this.apiUrl}/items`, { gameId, quantity })
      .pipe(
        tap(response => {
          if (response.success) {
            this.loadCart().subscribe();
          }
        }),
        catchError(error => {
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
    if (!this.authService.isAuthenticated) {
      let cart = this.cartSubject.value || { items: [], totalAmount: 0, itemCount: 0 };
      cart.items = cart.items.filter(i => i.id !== itemId);
      cart.itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
      cart.totalAmount = cart.items.reduce((sum, i) => sum + i.itemTotal, 0);
      this.saveLocalCart(cart);
      this.toastService.showSuccess('Producto eliminado del carrito');
      return new BehaviorSubject({ success: true }).asObservable();
    }
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
          return throwError(() => error);
        }),
        tap(() => this.loadingSubject.next(false))
      );
  }

  /**
   * Vaciar el carrito
   */
  clearCart(): Observable<any> {
    if (!this.authService.isAuthenticated) {
      this.clearLocalCart();
      this.toastService.showSuccess('Carrito vaciado');
      return new BehaviorSubject({ success: true }).asObservable();
    }
    this.loadingSubject.next(true);
    return this.http.delete<any>(this.apiUrl)
      .pipe(
        tap(response => {
          if (response.success) {
            this.toastService.showSuccess('Carrito vaciado');
            this.cartSubject.next({ items: [], totalAmount: 0, itemCount: 0 });
          }
        }),
        catchError(error => {
          return throwError(() => error);
        }),
        tap(() => this.loadingSubject.next(false))
      );
  }
} 