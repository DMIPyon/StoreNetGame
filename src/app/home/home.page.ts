import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { Product, Category, ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { ToastService } from '../services/toast.service';
import { FormatClpPipe } from '../pipes/format-clp.pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, IonicModule, RouterModule, FormsModule, FormatClpPipe],
})
export class HomePage implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategory: number = 0;
  isLoading: boolean = true;
  searchTerm: string = '';
  cartItemCount: number = 0;
  
  // Suscripciones para limpiarlas al destruir el componente
  private subscriptions: Subscription[] = [];
  
  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private toastService: ToastService
  ) {}
  
  ngOnInit() {
    // Suscribirse a los productos
    this.subscriptions.push(
      this.productService.getProducts().subscribe(products => {
        this.products = products;
        this.filteredProducts = products;
      })
    );
    
    // Suscribirse a las categorías
    this.subscriptions.push(
      this.productService.getCategories().subscribe(categories => {
        this.categories = categories;
      })
    );
    
    // Suscribirse al estado de carga
    this.subscriptions.push(
      this.productService.getLoadingState().subscribe(isLoading => {
        this.isLoading = isLoading;
      })
    );
    
    // Suscribirse al contador de elementos del carrito
    this.subscriptions.push(
      this.cartService.getCartItemCount().subscribe(count => {
        this.cartItemCount = count;
      })
    );
  }
  
  /**
   * Limpia las suscripciones al destruir el componente
   */
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  /**
   * Filtra productos por categoría
   * @param categoryId ID de la categoría para filtrar
   */
  selectCategory(categoryId: number) {
    this.selectedCategory = categoryId;
    
    if (categoryId === 0) {
      this.filteredProducts = this.products;
    } else {
      const categoryName = this.categories.find(c => c.id === categoryId)?.name;
      if (!categoryName) {
        this.filteredProducts = [];
        return;
      }
      this.filteredProducts = this.products.filter(product => 
        product.categories?.includes(categoryName)
      );
    }
  }
  
  /**
   * Busca productos por término
   */
  searchProducts() {
    if (!this.searchTerm.trim()) {
      this.selectCategory(this.selectedCategory);
      return;
    }
    
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(searchTermLower);
      const descMatch = product.description?.toLowerCase().includes(searchTermLower);
      const devMatch = product.developer?.toLowerCase().includes(searchTermLower);
      const categoryMatch = product.categories?.some(cat => cat.toLowerCase().includes(searchTermLower)) || false;
      const tagMatch = product.tags?.some(tag => tag.toLowerCase().includes(searchTermLower)) || false;
      
      return nameMatch || descMatch || devMatch || categoryMatch || tagMatch;
    });
  }
  
  /**
   * Agrega un producto al carrito
   * @param product El producto a agregar
   */
  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }
  
  /**
   * Navega a la página de detalles del producto
   * @param productId ID del producto
   */
  viewProductDetails(productId: number) {
    this.router.navigate(['/game-details', productId]);
  }
  
  /**
   * Obtiene el nombre de la categoría seleccionada
   */
  getCategoryName(): string {
    const category = this.categories.find(c => c.id === this.selectedCategory);
    return category ? category.name : 'Categoría';
  }
}
