import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./home/home.page').then(m => m.HomePage) },
  { path: 'main-login', loadComponent: () => import('./main-login/main-login.page').then(m => m.MainLoginPage) },
  { path: 'register', loadComponent: () => import('./register/register.page').then(m => m.RegisterPage) },
  { path: 'cart', loadComponent: () => import('./cart/cart.page').then(m => m.CartPage) },
  { path: 'game-details/:id', loadComponent: () => import('./game-details/game-details.page').then(m => m.GameDetailsPage) },
  { path: '**', redirectTo: 'home' } // Ruta comodín para redirigir a home si no se encuentra la ruta
];