import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// 3rd-Party plugins variables
import { InlineSVGModule } from 'ng-inline-svg-2';
import { QuillModule } from 'ngx-quill';
import { 
  NgbTooltipModule,
  NgbModalModule 
} from '@ng-bootstrap/ng-bootstrap';

import { ContactsRoutingModule } from './contacts-routing.module';

import { ContactsComponent } from './contacts.component';
import { ContactsListComponent } from './contacts-list/contacts-list.component';

import { EditContactsComponent } from './edit-contacts/edit-contacts.component';
import { DeleteContactsComponent } from './delete-contacts/delete-contacts.component';
import { UploadImageComponent } from './edit-contacts/upload-image/upload-image.component';

import { 
  CRUDTableModule,
  KeeniconModule,
  SharedModule 
} from '../../../shared';

@NgModule({
  declarations: [
    ContactsComponent,
    ContactsListComponent,
    EditContactsComponent,
    DeleteContactsComponent,
    // Image
    UploadImageComponent
  ],
  imports: [
    CommonModule,
    ContactsRoutingModule,
    FormsModule, 
    ReactiveFormsModule,
    InlineSVGModule,
    NgbTooltipModule,
    NgbModalModule,    
    QuillModule.forRoot(),
    KeeniconModule,
    CRUDTableModule,
    SharedModule
  ]
})
export class ContactsModule { }
