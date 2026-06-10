import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClientsComponent } from './clients.component';
import { ClientsListComponent } from './clients-list/clients-list.component';
import { ClientsEditComponent } from './clients-edit/clients-edit.component';

const routes: Routes = [
  {
    path: '',
    data: {
      translate: 'nav.clientsNav',
    },
    component: ClientsComponent,
    children: [
      {
        path: '',
        data: {
          translate: 'nav.clientsNav',
          breadcrumb: 'nav.listNav',
        },         
        component: ClientsListComponent,
      },      
      {
        path: 'add',
        data: {
          translate: 'nav.clientsNav',
          breadcrumb: 'nav.addNav'
        },       
        component: ClientsEditComponent
      },
      {
        path: 'edit/:id',
        data: {
          translate: 'nav.clientsNav',
          breadcrumb: 'nav.editNav'
        },          
        component: ClientsEditComponent
      },      
    ]    
  }
]; 

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule { }
