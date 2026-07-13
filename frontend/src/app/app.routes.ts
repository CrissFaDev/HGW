import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { HomePage } from './pages/home-page/home-page';
import { LoginPage } from './pages/login-page/login-page';
import { ProductsPage } from './pages/products-page/products-page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'productos', component: ProductsPage },
  { path: 'login', component: LoginPage },
  { path: 'admin', component: AdminDashboard, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
