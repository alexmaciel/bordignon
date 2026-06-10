import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        data: {
            reuse: false,
        },         
        loadChildren: () =>
          import('./layout/layout.module').then((m) => m.LayoutModule),
    },   
    {
        path: 'error',
        data: {
            reuse: false,
        },         
        loadChildren: () =>
          import('./errors/errors.module').then((m) => m.ErrorsModule),
    },      
    { path: '**', redirectTo: 'error' },      
];
