import { Routes } from '@angular/router';

const Routing: Routes = [    
  {
    path: 'home',
    title: 'Home',
    data: {
      animation: 'home',
      reuse: false,
    },       
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
  },  
  {
    path: 'escritorio',
    title: 'Escritório',
    data: {
      animation: 'escritorio',
      reuse: false,
    },       
    loadChildren: () => import('./company/company.module').then((m) => m.CompanyModule),
  },   
  {
    path: 'servicos',
    title: 'Serviços',
    data: {
      animation: 'servicos',
      reuse: false,
    },       
    loadChildren: () => import('./services/services.module').then((m) => m.ServicesModule),
  },              
  {
    path: 'contato',
    title: 'Contato',
    data: {
      animation: 'contato',
      reuse: false,
    },       
    loadChildren: () => import('./contact/contact.module').then((m) => m.ContactModule),
  },  
  {
    path: 'tdu',
    title: 'Privacidade',
    data: {
      animation: 'privacy',
      reuse: false,
    },       
    loadChildren: () => import('./tou/tou.module').then((m) => m.TouModule),
  },    
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },   
];
export { Routing };