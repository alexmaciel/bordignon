import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ContactsComponent } from './contacts.component';
import { ContactsListComponent } from './contacts-list/contacts-list.component';

const routes: Routes = [
  {
    path: '',
    data: {
      translate: 'nav.contactsNav',
    },      
    component: ContactsComponent,
    children: [
      {
        path: '',
        data: {
          translate: 'nav.contactsNav',
          breadcrumb: 'nav.listNav',
        },          
        component: ContactsListComponent,
      },  
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactsRoutingModule { }
