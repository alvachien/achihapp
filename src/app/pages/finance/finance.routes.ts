import { Routes } from '@angular/router';

export const FINANCE_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./overview').then((m) => m.OverviewComponent),
    },
    {
        path: 'currencies',
        loadComponent: () => import('./currencies').then((m) => m.CurrenciesComponent),
    },
];
