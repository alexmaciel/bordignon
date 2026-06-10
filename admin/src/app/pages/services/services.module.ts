import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// 3rd-Party plugins variables
import { QuillModule } from 'ngx-quill';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgApexchartsModule } from 'ng-apexcharts';
import { 
  NgbModalModule,
  NgbTooltipModule
} from '@ng-bootstrap/ng-bootstrap';

// Overview
import { WidgetDateComponent } from './overview/components/widget-date/widget-date.component';
import { WidgetDropdownComponent } from './overview/components/widget-dropdow/widget-dropdown.component';
import { OverviewComponent } from './overview/overview.component';

import { ServicesListComponent } from './services-list/services-list.component';

// Components
import { EditItemComponent } from './components/edit-items/edit-item.component';
import { DeleteItemComponent } from './components/delete-items/delete-item.component'

import { ServicesRoutingModule } from './services-routing.module';
import { ServicesComponent } from './services.component';

import { 
  CRUDTableModule,
  KeeniconModule,
  SharedModule 
} from '../../shared';

@NgModule({
  declarations: [
    ServicesComponent,
    EditItemComponent,
    DeleteItemComponent,
    ServicesListComponent,
    // Overview
    OverviewComponent,
    WidgetDateComponent,
    WidgetDropdownComponent,
  ],
  imports: [
    CommonModule,
    ServicesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    InlineSVGModule,
    NgbModalModule,
    NgbTooltipModule,
    DragDropModule,
    KeeniconModule,
    QuillModule,
    KeeniconModule,
    QuillModule,
    CRUDTableModule,
    NgApexchartsModule,
    SharedModule, 
  ]
})
export class ServicesModule { }
