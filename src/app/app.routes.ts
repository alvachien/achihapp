import { Routes } from '@angular/router';
import { homeChosenGuard } from './util';
import { SigninCallbackComponent } from './signin-callback.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },

  // Welcome
  { path: 'welcome', loadComponent: () => import('./pages/welcome').then( m=> m.WelcomeComponent ) },

  // Home Def.
  { path: 'homedef', loadChildren: () => import('./pages/home-def/home-def.routes').then( m=> m.HOMEDEF_ROUTES )},

  // Finance
  { 
    path: 'finance', 
    canActivateChild: [homeChosenGuard],
    loadChildren: () => import('./pages/finance/finance.routes').then( m=> m.FINANCE_ROUTES ) 
  },

  // About.
  { path: 'about', loadChildren: () => import('./pages/about/about.routes').then( m=> m.ABOUT_ROUTES ) },

  // Credits.
  { path: 'credits', loadChildren: () => import('./pages/credits/credits.routes').then( m=> m.CREDITS_ROUTES ) },

  // Version
  { path: 'version', loadChildren: () => import('./pages/version/version.routes').then( m=> m.VERSION_ROUTES ) },

  // Language
  { path: 'languages', loadChildren: () => import('./pages/language/language-routes').then( m=> m.LANGUAGES_ROUTES ) },

  // Fatal error
  { path: 'fatalerror', loadChildren: () => import('./pages/fatal-error/fatal-error.routes').then( m=> m.FATALERROR_ROUTES ) },  

  // Sign-in call back
  { path: 'signin-callback', component: SigninCallbackComponent },

  // Other => 404
  { path: '**', loadChildren: () => import('./pages/not-found/not-found.routes').then(m => m.NOT_FOUND_ROUTES) },
];
