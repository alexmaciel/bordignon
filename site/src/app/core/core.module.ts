import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// 3rd-Party plugins variables
import { AngularSvgIconModule } from 'angular-svg-icon';

// Pagination
import { NgPagination } from './helpers/paginator/ng-pagination/ng-pagination.component';
import { PaginatorComponent } from './helpers/paginator/paginator.component';

// Pipes
import { 
  TruncatetextPipe,
  SafePipe
} from './pipes';
// Directives
import { 
  PageScrollDirective,
  LinkScrollDirective,
  ToggleMenuDirective,
} from './directives';
// Components
import { 
  // Cursor
  ContactComponent
} from './components';
// Services
import {
  ApiExtendedService,
} from './services';


import { 
  AnalyticsService, 
  HelperTitleStrategy, 
  SeoService 
} from './utils';

@NgModule({
  declarations: [
    // Pagination
    NgPagination,
    PaginatorComponent,    
    // Pipes
    TruncatetextPipe,
    SafePipe,
    // Directives
    PageScrollDirective,
    LinkScrollDirective,
    ToggleMenuDirective,    
    // Components
    ContactComponent,
  ],
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    AngularSvgIconModule.forRoot(),
  ],
  exports: [
    // Pagination
    NgPagination,
    PaginatorComponent,       
    // Pipes
    TruncatetextPipe,
    SafePipe,
    // Directives
    //PageScrollDirective,
    LinkScrollDirective,
    ToggleMenuDirective, 
    // Components
    ContactComponent,  
  ],
  providers: [
    //API
    ApiExtendedService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CoreModule { }
