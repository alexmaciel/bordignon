import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompanyRoutingModule } from './company-routing.module';
import { CompanyComponent } from './company.component';

import { 
  NgxSwiperModule,
  NgxOptimizedImageModule
} from '../../shared';

 import { CoreModule } from '../../core';

@NgModule({
  declarations: [
    CompanyComponent
  ],
  imports: [
    CommonModule,
    CompanyRoutingModule,
    NgxSwiperModule,
    NgxOptimizedImageModule,
    CoreModule   
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CompanyModule { }
