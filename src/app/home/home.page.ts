import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, IonicModule, RouterModule],
})
export class HomePage {
  products: any[] = [];

  constructor(private http: HttpClient) { 
    this.loadProducts();
  }

  loadProducts() {
    this.http.get<any[]>('/assets/products.json').subscribe({
      next: (data) => {
        console.log('Productos cargados:', data);
        this.products = data;
      },
      error: (err) => console.error('Error cargando productos:', err),
    });
  }
}
