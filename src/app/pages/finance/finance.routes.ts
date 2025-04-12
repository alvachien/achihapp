import { Routes } from '@angular/router';

export const FINANCE_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./overview').then((m) => m.OverviewComponent),
    },
    {
        path: 'overview',
        loadComponent: () => import('./overview').then((m) => m.OverviewComponent),
    },
    {
        path: 'currencies',
        loadComponent: () => import('./currencies').then((m) => m.CurrenciesComponent),
    },
    {
        path: 'config',
        loadChildren: () => import('./config/config.routes').then((m) => m.CONFIG_ROUTES),
    },
];
