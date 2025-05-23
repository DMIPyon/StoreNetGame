import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';

export interface OrderItem {
  id: number;
  quantity: number;
  price_at_purchase: number;
  title: string;
}

export interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  items?: OrderItem[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;
  
  // BehaviorSubject para el estado de carga
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  // BehaviorSubject para las órdenes
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  /**
   * Obtener historial de órdenes del usuario
   */
  getUserOrders(): Observable<Order[]> {
    this.loadingSubject.next(true);
    
    return this.http.get<any>(this.apiUrl)
      .pipe(
        map(response => {
          if (response.success) {
            this.ordersSubject.next(response.data);
            return response.data;
          } else {
            throw new Error(response.message || 'Error al cargar el historial de órdenes');
          }
        }),
        catchError(error => {
          // console.error('Error cargando órdenes:', error);
          return throwError(() => error);
        }),
        tap(() => this.loadingSubject.next(false))
      );
  }

  /**
   * Obtener detalles de una orden específica
   */
  getOrderDetails(orderId: number): Observable<Order> {
    this.loadingSubject.next(true);
    
    return this.http.get<any>(`${this.apiUrl}/${orderId}`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message || 'Error al cargar los detalles de la orden');
          }
        }),
        catchError(error => {
          // console.error('Error cargando detalles de orden:', error);
          return throwError(() => error);
        }),
        tap(() => this.loadingSubject.next(false))
      );
  }

  /**
   * Crear una nueva orden a partir del carrito
   */
  createOrder(orderData: {
    paymentMethod: string;
    shippingAddress?: string;
  }): Observable<any> {
    this.loadingSubject.next(true);
    
    return this.http.post<any>(this.apiUrl, orderData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.toastService.showSuccess('¡Orden creada exitosamente!');
          }
        }),
        catchError(error => {
          // console.error('Error al crear orden:', error);
          this.toastService.showError(
            error.error?.message || 'Error al procesar la orden'
          );
          return throwError(() => error);
        }),
        tap(() => this.loadingSubject.next(false))
      );
  }

  /**
   * Cancelar una orden
   */
  cancelOrder(orderId: number): Observable<any> {
    this.loadingSubject.next(true);
    
    return this.http.put<any>(`${this.apiUrl}/${orderId}/cancel`, {})
      .pipe(
        tap(response => {
          if (response.success) {
            this.toastService.showSuccess('Orden cancelada correctamente');
            // Actualizar la lista de órdenes
            this.getUserOrders().subscribe();
          }
        }),
        catchError(error => {
          // console.error('Error al cancelar orden:', error);
          this.toastService.showError(
            error.error?.message || 'Error al cancelar la orden'
          );
          return throwError(() => error);
        }),
        tap(() => this.loadingSubject.next(false))
      );
  }

  /**
   * Formatear estado de la orden a español
   */
  formatOrderStatus(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'Procesando';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  }

  /**
   * Obtener clase CSS según el estado de la orden
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'order-pending';
      case 'processing':
        return 'order-processing';
      case 'completed':
        return 'order-completed';
      case 'cancelled':
        return 'order-cancelled';
      default:
        return '';
    }
  }

  getOrderHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/history`);
  }
} 