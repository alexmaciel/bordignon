import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CrmComponent } from './crm.component';

// components
import { 
  OverviewComponent,
  // Clients
  ClientsComponent,
  ClientsEditComponent
} from './components';

const routes: Routes = [
  {
    path: '',
    data: {
      translate: 'CRM',
    },    
    component: CrmComponent,
    children: [
      {
        path: 'overview',
        data: {
          translate: 'CRM',
          breadcrumb: 'nav.overviewNav',
        },         
        component: OverviewComponent,
      },     
      {
        path: 'clients',   
        loadChildren: () =>
          import('./clients/clients.module').then((m) => m.ClientsModule), 
      },  
      {
        path: 'contacts',       
        loadChildren: () =>
          import('./contacts/contacts.module').then((m) => m.ContactsModule), 
      },        
      {
        path: 'leads',    
        loadChildren: () =>
          import('./leads/leads.module').then((m) => m.LeadsModule), 
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
export class CrmRoutingModule { }
