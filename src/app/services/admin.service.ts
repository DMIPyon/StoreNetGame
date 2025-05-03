import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from './auth.service';
import { Game } from '../interfaces/game.interface';
import { Category } from './category.service';

export interface AdminStats {
  totalUsers: number;
  totalGames: number;
  totalOrders: number;
  totalCategories: number;
  recentSales?: number;
  totalRevenue?: number;
}

export interface Order {
  id: number;
  userId: number;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: Date;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  gameId: number;
  quantity: number;
  price: number;
  game?: Game;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) { }

  // Dashboard
  getDashboardStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats`).pipe(
      catchError(error => {
        console.error('Error al obtener estadísticas:', error);
        return throwError(() => new Error('No se pudieron cargar las estadísticas'));
      })
    );
  }

  // Usuarios
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      catchError(error => {
        console.error('Error al obtener usuarios:', error);
        return throwError(() => new Error('No se pudieron cargar los usuarios'));
      })
    );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`).pipe(
      catchError(error => {
        console.error(`Error al obtener usuario con ID ${id}:`, error);
        return throwError(() => new Error(`No se pudo cargar el usuario con ID ${id}`));
      })
    );
  }

  updateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, userData).pipe(
      catchError(error => {
        console.error(`Error al actualizar usuario con ID ${id}:`, error);
        return throwError(() => new Error(`No se pudo actualizar el usuario con ID ${id}`));
      })
    );
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`).pipe(
      catchError(error => {
        console.error(`Error al eliminar usuario con ID ${id}:`, error);
        return throwError(() => new Error(`No se pudo eliminar el usuario con ID ${id}`));
      })
    );
  }

  // Juegos
  createGame(gameData: Partial<Game>): Observable<Game> {
    return this.http.post<Game>(`${this.apiUrl}/games`, gameData).pipe(
      catchError(error => {
        console.error('Error al crear juego:', error);
        return throwError(() => new Error('No se pudo crear el juego'));
      })
    );
  }

  updateGame(id: number, gameData: Partial<Game>): Observable<Game> {
    return this.http.put<Game>(`${this.apiUrl}/games/${id}`, gameData).pipe(
      catchError(error => {
        console.error(`Error al actualizar juego con ID ${id}:`, error);
        return throwError(() => new Error(`No se pudo actualizar el juego con ID ${id}`));
      })
    );
  }

  deleteGame(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/games/${id}`).pipe(
      catchError(error => {
        console.error(`Error al eliminar juego con ID ${id}:`, error);
        return throwError(() => new Error(`No se pudo eliminar el juego con ID ${id}`));
      })
    );
  }

  // Categorías
  createCategory(categoryData: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, categoryData).pipe(
      catchError(error => {
        console.error('Error al crear categoría:', error);
        return throwError(() => new Error('No se pudo crear la categoría'));
      })
    );
  }

  updateCategory(id: number, categoryData: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, categoryData).pipe(
      catchError(error => {
        console.error(`Error al actualizar categoría con ID ${id}:`, error);
        return throwError(() => new Error(`No se pudo actualizar la categoría con ID ${id}`));
      })
    );
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`).pipe(
      catchError(error => {
        console.error(`Error al eliminar categoría con ID ${id}:`, error);
        return throwError(() => new Error(`No se pudo eliminar la categoría con ID ${id}`));
      })
    );
  }

  // Pedidos
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`).pipe(
      catchError(error => {
        console.error('Error al obtener pedidos:', error);
        return throwError(() => new Error('No se pudieron cargar los pedidos'));
      })
    );
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`).pipe(
      catchError(error => {
        console.error(`Error al obtener pedido con ID ${id}:`, error);
        return throwError(() => new Error(`No se pudo cargar el pedido con ID ${id}`));
      })
    );
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/orders/${id}`, { status }).pipe(
      catchError(error => {
        console.error(`Error al actualizar estado del pedido con ID ${id}:`, error);
        return throwError(() => new Error(`No se pudo actualizar el estado del pedido con ID ${id}`));
      })
    );
  }
} 