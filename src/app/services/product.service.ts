import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description?: string;
  categories?: string[];
  developer?: string;
  releaseDate?: string;
  tags?: string[];
  rating?: number;
  discount?: number;
  requirements?: {
    minimum?: {
      os?: string;
      processor?: string;
      memory?: string;
      graphics?: string;
      storage?: string;
    },
    recommended?: {
      os?: string;
      processor?: string;
      memory?: string;
      graphics?: string;
      storage?: string;
    }
  };
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  private products: Product[] = [];
  private categories: Category[] = [];
  private isLoading = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.loadProducts();
    this.loadCategories();
  }

  // Obtener productos como Observable
  getProducts(): Observable<Product[]> {
    return this.productsSubject.asObservable();
  }

  // Obtener categorías como Observable
  getCategories(): Observable<Category[]> {
    return this.categoriesSubject.asObservable();
  }

  // Estado de carga
  getLoadingState(): Observable<boolean> {
    return this.isLoading.asObservable();
  }

  // Cargar todos los productos
  loadProducts(): void {
    this.isLoading.next(true);
    
    this.http.get<Product[]>('assets/products.json')
      .pipe(
        tap((data) => {
          // Enriquecer datos si es necesario (calcular descuentos, etc.)
          this.products = data.map(product => {
            // Transformar el precio para que se muestre correctamente
            const processedProduct = {...product};
            
            // Si tiene precio original, calcular descuento
            if (product.originalPrice && product.originalPrice > product.price) {
              const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
              processedProduct.discount = discount;
            }
            
            return processedProduct;
          });
          this.productsSubject.next(this.products);
        }),
        catchError(error => {
          console.error('Error cargando productos:', error);
          return of([]);
        }),
        tap(() => this.isLoading.next(false))
      )
      .subscribe();
  }

  // Cargar categorías
  loadCategories(): void {
    this.http.get<Category[]>('assets/categories.json')
      .pipe(
        catchError(error => {
          console.error('Error cargando categorías:', error);
          // Categorías predeterminadas si no se puede cargar el archivo
          const defaultCategories: Category[] = [
            { id: 1, name: 'Acción', icon: 'flame-outline' },
            { id: 2, name: 'Aventura', icon: 'map-outline' },
            { id: 3, name: 'RPG', icon: 'game-controller-outline' },
            { id: 4, name: 'Estrategia', icon: 'bulb-outline' },
            { id: 5, name: 'Deportes', icon: 'football-outline' },
            { id: 6, name: 'Indie', icon: 'star-outline' },
            { id: 7, name: 'Simulación', icon: 'desktop-outline' }
          ];
          return of(defaultCategories);
        })
      )
      .subscribe(categories => {
        this.categories = categories;
        this.categoriesSubject.next(this.categories);
      });
  }

  // Obtener un producto por ID
  getProductById(id: number): Observable<Product | undefined> {
    return this.getProducts().pipe(
      map(products => products.find(product => product.id === id))
    );
  }

  // Filtrar productos por categoría
  filterByCategory(categoryId: number): void {
    if (categoryId === 0) { // 0 significa "Todos"
      this.productsSubject.next(this.products);
      return;
    }

    const categoryName = this.categories.find(c => c.id === categoryId)?.name || '';
    if (!categoryName) {
      this.productsSubject.next([]);
      return;
    }

    const filtered = this.products.filter(product => 
      product.categories?.includes(categoryName)
    );
    this.productsSubject.next(filtered);
  }

  // Buscar productos por término
  searchProducts(term: string): void {
    if (!term.trim()) {
      this.productsSubject.next(this.products);
      return;
    }

    const searchTerm = term.toLowerCase();
    const filtered = this.products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.developer?.toLowerCase().includes(searchTerm) ||
      product.categories?.some(cat => cat.toLowerCase().includes(searchTerm)) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    this.productsSubject.next(filtered);
  }

  // Obtener productos en oferta
  getDiscountedProducts(): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => products.filter(product => product.discount && product.discount > 0))
    );
  }
} 