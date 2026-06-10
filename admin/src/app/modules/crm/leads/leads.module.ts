import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// 3rd-Party plugins variables
import { InlineSVGModule } from 'ng-inline-svg-2';
import { QuillModule } from 'ngx-quill';
import { 
  NgbModalModule,
  NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';

import { LeadsRoutingModule } from './leads-routing.module';

import { LeadsComponent } from './leads.component';
import { LeadsListComponent } from './leads-list/leads-list.component';

import { LeadsEditComponent } from './leads-edit/leads-edit.component';
import { LeadsDeleteComponent } from './leads-delete/leads-delete.component';
import { LeadsDeleteSelectedComponent } from './leads-delete-selected/leads-delete-selected.component';

import { ConvertLeadToCustomerComponent } from './components/convert-lead-to-customer/convert-lead-to-customer.component';


import { 
  CRUDTableModule,
  KeeniconModule,
  SharedModule 
} from '../../../shared';

@NgModule({
  declarations: [
    LeadsComponent,
    LeadsListComponent,
    LeadsEditComponent,
    LeadsDeleteComponent,
    LeadsDeleteSelectedComponent,
    // Coverte leads
    ConvertLeadToCustomerComponent
  ],
  imports: [
    CommonModule,
    LeadsRoutingModule,
    FormsModule, 
    ReactiveFormsModule,
    InlineSVGModule,
    NgbModalModule,
    NgbDropdownModule,    
    QuillModule.forRoot(),
    CRUDTableModule,
    KeeniconModule,
    SharedModule
  ]
})
export class LeadsModule { }
