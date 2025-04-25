import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from './product.service';
import { ToastService } from './toast.service';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private readonly CART_STORAGE_KEY = 'netgames_cart';
  
  constructor(private toastService: ToastService) {
    this.loadCartFromStorage();
  }

  /**
   * Carga el carrito desde el almacenamiento local
   */
  private loadCartFromStorage(): void {
    try {
      const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
      if (savedCart) {
        this.cartItems = JSON.parse(savedCart);
        this.cartItemsSubject.next(this.cartItems);
      }
    } catch (error) {
      console.error('Error al cargar el carrito desde localStorage:', error);
      this.cartItems = [];
      this.cartItemsSubject.next(this.cartItems);
    }
  }

  /**
   * Obtiene todos los items del carrito como Observable
   */
  getCartItems(): Observable<CartItem[]> {
    return this.cartItemsSubject.asObservable();
  }

  /**
   * Obtiene el número total de items en el carrito
   */
  getCartItemCount(): Observable<number> {
    return this.cartItemsSubject.pipe(
      map(items => items.reduce((total, item) => total + item.quantity, 0))
    );
  }

  /**
   * Obtiene el subtotal del carrito
   */
  getSubtotal(): Observable<number> {
    return this.cartItemsSubject.pipe(
      map(items => items.reduce((total, item) => total + (item.price * item.quantity), 0))
    );
  }

  /**
   * Agrega un producto al carrito
   * @param product El producto a agregar
   */
  addToCart(product: Product): void {
    const existingItem = this.cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cartItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }
    
    this.saveCart();
    this.toastService.showCustomNotification(product.name, 'Añadido al carrito');
  }

  /**
   * Actualiza la cantidad de un item
   * @param item El item a actualizar
   * @param quantity La nueva cantidad
   */
  updateQuantity(item: CartItem, quantity: number): void {
    const existingItem = this.cartItems.find(i => i.id === item.id);
    
    if (existingItem) {
      existingItem.quantity = quantity;
      if (existingItem.quantity <= 0) {
        this.removeItem(item);
        return;
      }
      this.toastService.showCustomNotification(item.name, 'Cantidad actualizada');
    }
    
    this.saveCart();
  }

  /**
   * Elimina un item del carrito
   * @param item El item a eliminar
   */
  removeItem(item: CartItem): void {
    this.cartItems = this.cartItems.filter(i => i.id !== item.id);
    this.saveCart();
    this.toastService.showCustomNotification(item.name, 'Eliminado del carrito');
  }

  /**
   * Vacía el carrito
   */
  clearCart(): void {
    this.cartItems = [];
    this.saveCart();
    this.toastService.showCustomNotification('Carrito', 'Carrito vacío');
  }

  /**
   * Guarda el carrito en el almacenamiento local
   */
  private saveCart(): void {
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.cartItems));
    this.cartItemsSubject.next([...this.cartItems]);
  }

  /**
   * Calcula los impuestos (IVA 21%)
   */
  calculateTax(): Observable<number> {
    return this.getSubtotal().pipe(
      map(subtotal => subtotal * 0.21)
    );
  }

  /**
   * Calcula el total (subtotal + impuestos)
   */
  calculateTotal(): Observable<number> {
    return this.getSubtotal().pipe(
      map(subtotal => subtotal + (subtotal * 0.21))
    );
  }
} 