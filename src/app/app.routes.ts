import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: 'welcome', loadComponent: () => import('./pages/welcome').then( m=> m.WelcomeComponent ) },
  { path: 'about', loadComponent: () => import('./pages/about').then( m=> m.AboutComponent ) },
  { path: '**', loadChildren: () => import('./pages/not-found/not-found.routes').then(m => m.NOT_FOUND_ROUTES) },
];
