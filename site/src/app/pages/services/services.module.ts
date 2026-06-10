import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// 3rd-Party plugins variables
import { AngularSvgIconModule } from 'angular-svg-icon';

// Components
import { ServiceListComponent } from './service-list/service-list.component';
import { ServiceDetailsComponent } from './service-details/service-details.component';

import { ServicesRoutingModule } from './services-routing.module';
import { ServicesComponent } from './services.component';

import { 
  NgxSwiperModule,
 } from '../../shared';

 import { CoreModule } from '../../core';

@NgModule({
  declarations: [
    ServicesComponent,
    ServiceDetailsComponent,
    ServiceListComponent
  ],
  imports: [
    CommonModule,
    ServicesRoutingModule,
    AngularSvgIconModule,
    NgxSwiperModule,
    CoreModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ServicesModule { }
