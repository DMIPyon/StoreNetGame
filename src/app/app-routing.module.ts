import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderHistoryPage } from './pages/order-history/order-history.page';

const routes: Routes = [
  { path: 'order-history', component: OrderHistoryPage },
  // ... otras rutas ...
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {} 