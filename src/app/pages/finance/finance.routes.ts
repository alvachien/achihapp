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
    {
        path: 'controlcenter',
        loadChildren: () => import('./control-center/control-center.routes').then((m) => m.CONTROL_CENTER_ROUTES),
    },
    {
        path: 'activity',
        loadChildren: () => import('./order/order.routes').then((m) => m.ORDER_ROUTES),
    },
    {
        path: 'account',
        loadChildren: () => import('./account/account.routes').then((m) => m.ACCOUNT_ROUTES),
    },
    {
        path: 'document',
        loadChildren: () => import('./document/document.routes').then((m) => m.DOCUMENT_ROUTES),
    },
];
