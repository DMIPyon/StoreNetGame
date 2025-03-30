import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService, Product } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { FormatClpPipe } from '../pipes/format-clp.pipe';

@Component({
  selector: 'app-game-details',
  standalone: true,
  templateUrl: './game-details.page.html',
  styleUrls: ['./game-details.page.scss'],
  imports: [CommonModule, IonicModule, RouterModule, FormatClpPipe]
})
export class GameDetailsPage implements OnInit {
  product: Product | undefined;
  isLoading = true;
  
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    // Obtener el ID del producto desde la URL
    this.route.paramMap.subscribe(params => {
      const productId = Number(params.get('id'));
      if (productId) {
        this.loadProductDetails(productId);
      }
    });
  }

  // Cargar detalles del producto
  loadProductDetails(productId: number) {
    this.isLoading = true;
    
    this.productService.getProductById(productId).subscribe(product => {
      this.product = product;
      this.isLoading = false;
      
      if (!product) {
        // Producto no encontrado
        console.error(`Producto con ID ${productId} no encontrado`);
      }
    });
  }

  // Agregar al carrito
  addToCart() {
    if (this.product) {
      this.cartService.addToCart(this.product);
      this.showToast(`${this.product.name} añadido al carrito`);
    }
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