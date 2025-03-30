import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { Product, Category, ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { FormatClpPipe } from '../pipes/format-clp.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, IonicModule, RouterModule, FormsModule, FormatClpPipe],
})
export class HomePage implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  selectedCategory: number = 0;
  isLoading: boolean = true;
  searchTerm: string = '';
  
  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}
  
  ngOnInit() {
    // Suscribirse a los productos
    this.productService.getProducts().subscribe(products => {
      this.products = products;
    });
    
    // Suscribirse a las categorías
    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
    
    // Suscribirse al estado de carga
    this.productService.getLoadingState().subscribe(isLoading => {
      this.isLoading = isLoading;
    });
  }
  
  // Filtrar productos por categoría
  selectCategory(categoryId: number) {
    this.selectedCategory = categoryId;
    this.productService.filterByCategory(categoryId);
  }
  
  // Buscar productos
  searchProducts() {
    this.productService.searchProducts(this.searchTerm);
  }
  
  // Agregar al carrito
  addToCart(product: Product) {
    this.cartService.addToCart(product);
    this.showToast(`${product.name} añadido al carrito`);
  }
  
  // Ver detalles del producto
  viewProductDetails(productId: number) {
    this.router.navigate(['/game-details', productId]);
  }
  
  // Mostrar mensaje de confirmación (Toast)
  private showToast(message: string) {
    // Esta funcionalidad se agregará cuando se implementen los componentes Ionic adecuados
    console.log('Toast message:', message);
  }
  
  // Formatear precio para mostrar con 2 decimales y separador de miles
  formatPrice(price: number): string {
    if (price == null) {
      return '0,00';
    }
    
    // Dividir por 100 y formatear con comas para miles y punto para decimales
    const formattedValue = (price/100).toFixed(2).replace('.', ',');
    
    // Agregar separadores de miles
    return formattedValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}
