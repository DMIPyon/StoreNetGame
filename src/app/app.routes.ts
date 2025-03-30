import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./home/home.page').then(m => m.HomePage) },
  { path: 'main-login', loadComponent: () => import('./main-login/main-login.page').then(m => m.MainLoginPage) },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then( m => m.RegisterPage)
  }
];