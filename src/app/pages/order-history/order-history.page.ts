import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.page.html',
  styleUrls: ['./order-history.page.scss']
})
export class OrderHistoryPage implements OnInit {
  orders: any[] = [];
  loading = true;

  constructor(private orderService: OrderService, private modalCtrl: ModalController) {}

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

  async verDetalle(orderId: number) {
    const { OrderDetailModalComponent } = await import('./order-detail-modal.component');
    const modal = await this.modalCtrl.create({
      component: OrderDetailModalComponent,
      componentProps: { orderId }
    });
    await modal.present();
  }
} 