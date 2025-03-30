import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
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
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategory: number = 0;
  isLoading: boolean = true;
  searchTerm: string = '';
  cartItemCount: number = 0;
  
  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private toastController: ToastController
  ) {}
  
  ngOnInit() {
    // Suscribirse a los productos
    this.productService.getProducts().subscribe(products => {
      this.products = products;
      this.filteredProducts = products;
    });
    
    // Suscribirse a las categorías
    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
    
    // Suscribirse al estado de carga
    this.productService.getLoadingState().subscribe(isLoading => {
      this.isLoading = isLoading;
    });
    
    // Suscribirse al contador de elementos del carrito
    this.cartService.getCartItemCount().subscribe(count => {
      this.cartItemCount = count;
    });
  }
  
  // Filtrar productos por categoría
  selectCategory(categoryId: number) {
    this.selectedCategory = categoryId;
    
    if (categoryId === 0) {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product => 
        product.category === this.categories.find(c => c.id === categoryId)?.name
      );
    }
  }
  
  // Buscar productos
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
      
      return nameMatch || descMatch || devMatch;
    });
  }
  
  // Agregar al carrito
  addToCart(product: Product) {
    this.cartService.addToCart(product);
    this.showCustomNotification(product.name);
  }
  
  // Mostrar notificación personalizada
  private showCustomNotification(productName: string) {
    // Eliminar notificación anterior si existe
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-header">${productName}</div>
        <div class="notification-message">Añadido al carrito</div>
        <div class="notification-icon">
          <ion-icon name="checkmark-circle"></ion-icon>
        </div>
      </div>
    `;
    
    // Añadir al body
    document.body.appendChild(notification);
    
    // Eliminar después de 2.5 segundos
    setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 2500);
  }
  
  // Ver detalles del producto
  viewProductDetails(productId: number) {
    this.router.navigate(['/game-details', productId]);
  }
  
  // Método original de toast (mantenido como respaldo)
  private async showToast(message: string) {
    // Extraer el nombre del producto del mensaje
    const productName = message.replace(' añadido al carrito correctamente', '');
    
    const toast = await this.toastController.create({
      header: productName,
      message: 'Añadido al carrito',
      duration: 2500,
      position: 'bottom',
      cssClass: 'cart-toast product-added-toast',
      buttons: [
        {
          icon: 'checkmark-circle',
          role: 'cancel'
        }
      ]
    });
    
    await toast.present();
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
