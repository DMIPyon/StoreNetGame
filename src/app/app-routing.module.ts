import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderHistoryPage } from './pages/order-history/order-history.page';
import { CheckoutSuccessPage } from './pages/checkout-success/checkout-success.page';
import { CartPage } from './pages/cart/cart.page';

const routes: Routes = [
  { path: 'cart', component: CartPage },
  { path: 'pago-exito', component: CheckoutSuccessPage },
  { path: 'order-history', component: OrderHistoryPage },
  // ... otras rutas ...
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {} 