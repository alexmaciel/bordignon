import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import localePT from '@angular/common/locales/pt';
registerLocaleData(localePT);
import localeEN from '@angular/common/locales/en';
registerLocaleData(localeEN);
import localeES from '@angular/common/locales/es';
registerLocaleData(localeES);

// 3rd-Party plugins variables
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgApexchartsModule } from 'ng-apexcharts';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { QuillModule } from 'ngx-quill';
import { 
  NgbModalModule, 
  NgbTooltipModule, 
  NgbDropdownModule, 
  NgbAccordionModule,
  NgbDatepickerModule 
} from '@ng-bootstrap/ng-bootstrap';

// Widget
import { WidgetDateComponent } from './overview/components/widget-date/widget-date.component';
import { WidgetDropdownComponent } from './overview/components/widget-dropdow/widget-dropdown.component';
// Overview
import { OverviewComponent } from './overview/overview.component';

// Components
import { DeleteProductComponent } from './products-list/components/delete-product/delete-product.component';
import { DeleteProductsComponent } from './products-list/components/delete-products/delete-products.component';
import { UpdateStatusComponent } from './products-list/components/update-status/update-status.component';
//images
import { UploadImageComponent } from './products-image/components/upload-image/upload-image.component';
import { DeleteProductImageComponent } from './products-image/components/delete-image/delete-product-image.component';
// Items
import { EditItemsComponent } from './products-items/components/edit-items/edit-items.component';
import { DeleteItemsComponent } from './products-items/components/delete-items/delete-items.component';
import { UploadImageItemsComponent } from './products-items/components/upload-image/upload-image-items.component';

import { ProductsImageComponent } from './products-image/products-image.component';
import { ProductsItemsComponent } from './products-items/products-items.component';
import { ProductsListComponent } from './products-list/products-list.component';
import { ProductsEditComponent } from './products-edit/products-edit.component';

import { TechnologyRoutingModule } from './products-routing.module';
import { ProductsComponent } from './products.component';


import { 
  CRUDTableModule,
  KeeniconModule,
  SharedModule 
} from '../../shared';

@NgModule({
  declarations: [
    ProductsComponent,
    OverviewComponent,
    // Widget
    WidgetDateComponent,
    WidgetDropdownComponent,
    ProductsListComponent,
    ProductsEditComponent,
    ProductsImageComponent,
    // Items
    ProductsItemsComponent,
    EditItemsComponent,
    DeleteItemsComponent,
    UploadImageItemsComponent,    
    // Componentes
    DeleteProductComponent,
    DeleteProductsComponent,
    UpdateStatusComponent,
    UploadImageComponent,
    DeleteProductImageComponent,    
  ],
  imports: [
    CommonModule,
    TechnologyRoutingModule,
    FormsModule, 
    ReactiveFormsModule,
    QuillModule.forRoot(),   
    NgbModalModule,   
    NgbDropdownModule, 
    NgbAccordionModule,
    NgbTooltipModule,
    NgbDatepickerModule,
    NgApexchartsModule,
    KeeniconModule,
    DragDropModule,     
    InlineSVGModule,
    NgSelectModule,
    CRUDTableModule,    
    SharedModule,  
  ]
})
export class ProductsModule { }
