import { Component, OnInit } from '@angular/core';
import { CartService, CartItem } from '../../services/cart.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems$: Observable<CartItem[]>;
  cartItemCount$: Observable<number>;
  subtotal$: Observable<number>;
  tax$: Observable<number>;
  total$: Observable<number>;

  constructor(private cartService: CartService) {
    this.cartItems$ = this.cartService.getCartItems();
    this.cartItemCount$ = this.cartService.getCartItemCount();
    this.subtotal$ = this.cartService.getSubtotal();
    this.tax$ = this.cartService.calculateTax();
    this.total$ = this.cartService.calculateTotal();
  }

  ngOnInit(): void {}

  // Actualizar cantidad de un item
  updateQuantity(item: CartItem, quantity: number): void {
    this.cartService.updateQuantity(item, quantity);
  }

  // Eliminar un item del carrito
  removeItem(item: CartItem): void {
    this.cartService.removeItem(item);
  }

  // Vaciar el carrito
  clearCart(): void {
    this.cartService.clearCart();
  }
} 