import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ServicesListComponent } from './services-list/services-list.component';
import { OverviewComponent } from './overview/overview.component';
import { ServicesComponent } from './services.component';

const routes: Routes = [
  {
    path: '',
    data: {
      translate: 'nav.servicesNav',
    },      
    component: ServicesComponent,
    children: [
      {
        path: 'overview',
        data: {
          translate: 'nav.productsNav',
          breadcrumb: 'nav.overviewNav',
        },         
        component: OverviewComponent,
      },        
      {
        path: 'list',
        data: {
          translate: 'nav.servicesNav',
          breadcrumb: 'nav.listNav',
        },          
        component: ServicesListComponent,
      },
      { path: '', redirectTo: 'overview', pathMatch: 'full' }, 
      { path: '**', redirectTo: 'overview', pathMatch: 'full' },      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicesRoutingModule { }
