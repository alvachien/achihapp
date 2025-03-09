import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: 'welcome', loadComponent: () => import('./pages/welcome').then( m=> m.WelcomeComponent ) },
  { path: 'about', loadChildren: () => import('./pages/about/about.routes').then( m=> m.ABOUT_ROUTES ) },
  { path: 'credits', loadChildren: () => import('./pages/credits/credits.routes').then( m=> m.CREDITS_ROUTES ) },
  { path: 'version', loadChildren: () => import('./pages/version/version.routes').then( m=> m.VERSION_ROUTES ) },
  { path: 'languages', loadChildren: () => import('./pages/language/language-routes').then( m=> m.LANGUAGES_ROUTES ) },
  { path: 'fatalerror', loadChildren: () => import('./pages/fatal-error/fatal-error.routes').then( m=> m.FATALERROR_ROUTES ) },
  { path: '**', loadChildren: () => import('./pages/not-found/not-found.routes').then(m => m.NOT_FOUND_ROUTES) },
];
