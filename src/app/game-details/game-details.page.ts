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
      const id = Number(params.get('id'));
      if (id) {
        this.isLoading = true;
        this.productService.getProductById(id).subscribe(product => {
          this.product = product;
          
          // Procesar la descripción para mejorar el formato del texto
          if (this.product && this.product.description) {
            this.product.description = this.processDescription(this.product.description);
          }
          
          this.isLoading = false;
          
          if (!product) {
            // Producto no encontrado
            console.error(`Producto con ID ${id} no encontrado`);
          }
        });
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

  // Añadir procesamiento para el texto de la descripción
  processDescription(description: string | undefined): string {
    if (!description) {
      return 'No hay descripción disponible para este juego.';
    }
    
    // Formatear párrafos (doble salto de línea)
    let formattedText = description.replace(/\n\n/g, '</p><p>');
    
    // Formatear saltos de línea simples
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    // Envolver en párrafos si no comienza con etiqueta <p>
    if (!formattedText.startsWith('<p>')) {
      formattedText = '<p>' + formattedText + '</p>';
    }
    
    return formattedText;
  }
} 