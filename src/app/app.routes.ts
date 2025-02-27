import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES) },
  { path: '**', loadChildren: () => import('./pages/not-found/not-found.routes').then(m => m.NOT_FOUND_ROUTES) },
];
