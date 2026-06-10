import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// 3rd-Party plugins variables
import { InlineSVGModule } from 'ng-inline-svg-2';
import { NgSelectModule } from '@ng-select/ng-select';
import { QuillModule } from 'ngx-quill';

import { 
  NgbDropdownModule, 
  NgbModalModule 
} from '@ng-bootstrap/ng-bootstrap';

import { CrmRoutingModule } from './crm-routing.module';
import { CrmComponent } from './crm.component';

// components
import { 
  OverviewComponent,
  // contacts
  // composer
  ComposerComponent,
} from './components';


import { 
  NGXDropzoneModule,
  KeeniconModule,
  SharedModule
} from '../../shared';

@NgModule({
  declarations: [
    CrmComponent,
    OverviewComponent,
    ComposerComponent,
  ],
  imports: [
    CommonModule,
    CrmRoutingModule,
    FormsModule, 
    ReactiveFormsModule,
    NgSelectModule,
    NgbDropdownModule, 
    NgbModalModule,
    InlineSVGModule,
    QuillModule.forRoot(),
    // Plugins
    KeeniconModule,
    NGXDropzoneModule,
    SharedModule
  ]
})
export class CrmModule { }
