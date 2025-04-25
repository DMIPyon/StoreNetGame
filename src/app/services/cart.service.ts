import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  
  constructor() {
    // Recuperar carrito del localStorage al iniciar
    this.loadCartFromStorage();
  }

  // Cargar carrito desde localStorage
  private loadCartFromStorage(): void {
    try {
      const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
      if (savedCart) {
        this.cartItems = JSON.parse(savedCart);
        this.cartItemsSubject.next(this.cartItems);
        console.log('Carrito cargado desde localStorage:', this.cartItems);
      }
    } catch (error) {
      console.error('Error al cargar el carrito desde localStorage:', error);
      // Si hay un error, inicializar con un carrito vacío
      this.cartItems = [];
      this.cartItemsSubject.next(this.cartItems);
    }
  }

  // Obtener todos los items del carrito como Observable
  getCartItems(): Observable<CartItem[]> {
    return this.cartItemsSubject.asObservable();
  }

  // Obtener número total de items en el carrito
  getCartItemCount(): Observable<number> {
    return this.cartItemsSubject.pipe(
      map(items => items.reduce((total, item) => total + item.quantity, 0))
    );
  }

  // Obtener el subtotal del carrito
  getSubtotal(): Observable<number> {
    return this.cartItemsSubject.pipe(
      map(items => items.reduce((total, item) => total + (item.price * item.quantity), 0))
    );
  }

  // Agregar un producto al carrito
  addToCart(product: any): void {
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
  }

  // Actualizar cantidad de un item
  updateQuantity(item: CartItem, quantity: number): void {
    const existingItem = this.cartItems.find(i => i.id === item.id);
    
    if (existingItem) {
      existingItem.quantity = quantity;
      if (existingItem.quantity <= 0) {
        this.removeItem(item);
        return;
      }
    }
    
    this.saveCart();
  }

  // Eliminar un item del carrito
  removeItem(item: CartItem): void {
    this.cartItems = this.cartItems.filter(i => i.id !== item.id);
    this.saveCart();
  }

  // Vaciar el carrito
  clearCart(): void {
    this.cartItems = [];
    this.saveCart();
  }

  // Guardar carrito en localStorage
  private saveCart(): void {
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.cartItems));
    this.cartItemsSubject.next([...this.cartItems]);
    console.log('Carrito guardado en localStorage:', this.cartItems);
  }

  // Calcular impuestos (IVA 21%)
  calculateTax(): Observable<number> {
    return this.getSubtotal().pipe(
      map(subtotal => subtotal * 0.21)
    );
  }

  // Calcular total (subtotal + impuestos)
  calculateTotal(): Observable<number> {
    return this.getSubtotal().pipe(
      map(subtotal => subtotal + (subtotal * 0.21))
    );
  }
} 