import { Routes } from '@angular/router';

const Routing: Routes = [
  {
    path: 'dashboard',
    data: {
      reuse: false,
    },       
    loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'slides',
    data: {
      reuse: false,
    },       
    loadChildren: () => import('./slides/slides.module').then((m) => m.SlidesModule),
  }, 
  {
    path: 'company',
    data: {
      reuse: false,
    },       
    loadChildren: () => import('./company/company.module').then((m) => m.CompanyModule),
  },  
  {
    path: 'teams',
    data: {
      reuse: false,
    },       
    loadChildren: () => import('./team/team.module').then((m) => m.TeamModule),
  },        
  {
    path: 'services',
    data: {
      reuse: false,
    },        
    loadChildren: () => import('./services/services.module').then((m) => m.ServicesModule),
  }, 
  {
    path: 'categories',
    data: {
      reuse: false,
    },     
    loadChildren: () => import('./categories/categories.module').then((m) => m.CategoriesModule),
  },           
  {
    path: 'profile',
    data: {
      title: 'Profile',
      translate: 'nav.profileNav',
      reuse: false
    },         
    loadChildren: () =>
      import('./profile/profile.module').then((m) => m.ProfileModule),
  },  
  {
    path: 'admins',
    data: {
      title: 'Admins',
      translate: 'nav.adminNav',
    },         
    loadChildren: () =>
      import('./admins/admins.module').then((m) => m.AdminsModule),
  },  
  {
    path: 'settings',
    data: {
      reuse: false
    },         
    loadChildren: () =>
      import('./settings/settings.module').then((m) => m.SettingsModule),
  },  
  {
    path: 'social',
    data: {
      translate: 'nav.socialNav',
      reuse: false
    },         
    loadChildren: () =>
      import('./social/social.module').then((m) => m.SocialModule),
  },      
  // CRM  
  {
    path: 'crm',
    data: {
      reuse: false
    },      
    loadChildren: () =>
      import('../modules/crm/crm.module').then((m) => m.CrmModule),
  },     
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
];

export { Routing };