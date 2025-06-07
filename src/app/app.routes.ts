import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./home/home.page').then(m => m.HomePage) },
  { path: 'main-login', loadComponent: () => import('./pages/main-login/main-login.page').then(m => m.MainLoginPage) },
  { path: 'register', loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage) },
  { path: 'cart', loadComponent: () => import('./pages/cart/cart.page').then(m => m.CartPage) },
  { path: 'game-details/:id', loadComponent: () => import('./pages/game-details/game-details.page').then(m => m.GameDetailsPage) },
  { path: 'offers', loadComponent: () => import('./pages/offers/offers.page').then(m => m.OffersPage) },
  { path: 'wishlist', loadComponent: () => import('./pages/wishlist/wishlist.page').then(m => m.WishlistPage) },
  { 
    path: 'profile', 
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
    canActivate: [AuthGuard]
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./pages/admin/admin.page').then(m => m.AdminPage),
    canActivate: [AuthGuard, AdminGuard]
  },
  { path: 'checkout-success', loadComponent: () => import('./pages/checkout-success/checkout-success.page').then(m => m.CheckoutSuccessPage) },
  { path: 'pago-exito', redirectTo: 'checkout-success', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },   {
    path: 'wallet',
    loadComponent: () => import('./src/app/pages/wallet/wallet.page').then( m => m.WalletPage)
  }
// Ruta comodín para redirigir a home si no se encuentra la ruta
];