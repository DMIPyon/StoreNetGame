import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.page.html',
  styleUrls: ['./order-history.page.scss']
})
export class OrderHistoryPage implements OnInit {
  orders: any[] = [];
  loading = true;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.orderService.getOrderHistory().subscribe({
      next: (res) => {
        this.orders = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.orders = [];
      }
    });
  }
} 