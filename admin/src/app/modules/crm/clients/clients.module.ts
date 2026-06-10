import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// 3rd-Party plugins variables
import { InlineSVGModule } from 'ng-inline-svg-2';
import { QuillModule } from 'ngx-quill';
import { 
  NgbAccordionModule,
  NgbDropdownModule, 
  NgbTooltipModule,
  NgbModalModule 
} from '@ng-bootstrap/ng-bootstrap';

import { ClientsRoutingModule } from './clients-routing.module';
import { ClientsComponent } from './clients.component';

import { ClientsListComponent } from './clients-list/clients-list.component';
import { ClientsEditComponent } from './clients-edit/clients-edit.component';

// contacts
import { ContactsComponent } from './clients-edit/contacts/contacts.component';
import { EditContactsComponent } from './clients-edit/contacts/edit-contacts/edit-contacts.component';
import { DeleteContactsComponent } from './clients-edit/contacts/delete-contacts/delete-contacts.component';
// social
import { SocialComponent } from './clients-edit/social/social.component';
import { EditSocialComponent } from './clients-edit/social/edit-social/edit-social.component';
import { DeleteSocialComponent } from './clients-edit/social/delete-social/delete-social.component';
// action
import { DeleteClientComponent } from './actions/delete/delete.component';
import { DeleteClientSelectedComponent } from './actions/delete-selected/delete-selected.component';
import { EditClientsComponent } from './actions/edit/edit.component';

// components
import { UploadImageComponent } from './clients-edit//components/upload-image/upload-image.component';
import { DeleteImageComponent } from './clients-edit//components/delete-image/delete-image.component';


import { 
  CRUDTableModule,
  KeeniconModule,
  SharedModule 
} from '../../../shared';


@NgModule({
  declarations: [
    ClientsComponent,    
    ClientsListComponent,
    ClientsEditComponent,
    ContactsComponent,
    EditClientsComponent,
    DeleteClientComponent,
    DeleteClientSelectedComponent,
    EditContactsComponent,
    DeleteContactsComponent,
    // Components Edit
    UploadImageComponent,
    DeleteImageComponent,
    // Social
    SocialComponent,
    EditSocialComponent,
    DeleteSocialComponent,
  ],
  imports: [
    CommonModule,
    ClientsRoutingModule,
    FormsModule, 
    ReactiveFormsModule,
    InlineSVGModule,
    QuillModule.forRoot(),
    NgbAccordionModule,
    NgbDropdownModule, 
    NgbTooltipModule,
    NgbModalModule,
    KeeniconModule,
    CRUDTableModule,
    SharedModule,
  ]
})
export class ClientsModule { }
