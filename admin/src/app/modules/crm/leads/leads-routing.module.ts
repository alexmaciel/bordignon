import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LeadsComponent } from './leads.component';
import { LeadsListComponent } from './leads-list/leads-list.component';

const routes: Routes = [
  {
    path: '',       
    data: {
      translate: 'nav.leadsNav',
    },        
    component: LeadsComponent,
    children: [
      {
        path: '',
        data: {
          translate: 'nav.leadsNav',
          breadcrumb: 'nav.listNav',
        },          
        component: LeadsListComponent,
      },  
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeadsRoutingModule { }
