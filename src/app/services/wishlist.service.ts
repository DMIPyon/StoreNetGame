import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';
import { Game } from '../interfaces/game.interface';

export interface WishlistItem {
  id: number;
  game_id: number;
  title: string;
  price: number;
  cover_url: string;
  discount?: number;
  original_price?: number;
  rating?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private localStorageKey = 'wishlist_items';
  
  // BehaviorSubject para mantener el estado de la lista de deseos
  private wishlistSubject = new BehaviorSubject<WishlistItem[]>([]);
  public wishlist$ = this.wishlistSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private authService: AuthService
  ) {
    // Cargar la lista de deseos al iniciar
    this.loadWishlist();
  }

  /**
   * Obtener el número total de items en la lista de deseos
   */
  getWishlistItemCount(): Observable<number> {
    return this.wishlist$.pipe(
      map(items => items.length)
    );
  }

  /**
   * Cargar la lista de deseos desde localStorage
   */
  private loadWishlist() {
    const wishlistData = localStorage.getItem(this.localStorageKey);
    let wishlist: WishlistItem[] = [];
    
    if (wishlistData) {
      try {
        wishlist = JSON.parse(wishlistData);
      } catch (e) {
        wishlist = [];
      }
    }
    
    this.wishlistSubject.next(wishlist);
  }

  /**
   * Guardar la lista de deseos en localStorage
   */
  private saveWishlist(items: WishlistItem[]) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(items));
    this.wishlistSubject.next(items);
  }

  /**
   * Verificar si un juego está en la lista de deseos
   */
  isInWishlist(gameId: number): Observable<boolean> {
    return this.wishlist$.pipe(
      map(items => items.some(item => item.game_id === gameId))
    );
  }

  /**
   * Añadir un juego a la lista de deseos
   */
  addToWishlist(game: Game): Observable<boolean> {
    // Obtener la lista actual
    const currentItems = this.wishlistSubject.value;
    
    // Verificar si el juego ya está en la lista
    if (currentItems.some(item => item.game_id === game.id)) {
      this.toastService.showInfo('Este juego ya está en tu lista de deseos');
      return new BehaviorSubject(false).asObservable();
    }
    
    // Crear nuevo item
    const newItem: WishlistItem = {
      id: Date.now(),
      game_id: game.id,
      title: game.title || game.name,
      price: game.price,
      cover_url: game.cover_url,
      discount: game.discount,
      original_price: game.originalPrice || undefined,
      rating: game.rating !== null ? game.rating : undefined
    };
    
    // Añadir a la lista
    const updatedItems = [...currentItems, newItem];
    this.saveWishlist(updatedItems);
    
    // Mostrar notificación
    this.toastService.showSuccess('Juego añadido a tu lista de deseos');
    
    return new BehaviorSubject(true).asObservable();
  }

  /**
   * Eliminar un juego de la lista de deseos
   */
  removeFromWishlist(gameId: number): Observable<boolean> {
    const currentItems = this.wishlistSubject.value;
    const updatedItems = currentItems.filter(item => item.game_id !== gameId);
    
    if (updatedItems.length === currentItems.length) {
      // No se encontró el item
      return new BehaviorSubject(false).asObservable();
    }
    
    this.saveWishlist(updatedItems);
    this.toastService.showSuccess('Juego eliminado de tu lista de deseos');
    
    return new BehaviorSubject(true).asObservable();
  }

  /**
   * Obtener todos los items de la lista de deseos
   */
  getWishlistItems(): Observable<WishlistItem[]> {
    return this.wishlist$;
  }

  /**
   * Vaciar la lista de deseos
   */
  clearWishlist(): Observable<boolean> {
    this.saveWishlist([]);
    this.toastService.showSuccess('Lista de deseos vaciada');
    
    return new BehaviorSubject(true).asObservable();
  }
} 