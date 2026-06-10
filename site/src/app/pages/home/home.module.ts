import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// 3rd-Party plugins variables
import { AngularSvgIconModule } from 'angular-svg-icon';

import { SliderComponent } from './slider/slider.component';
import { CompanyComponent } from './company/company.component';
import { ServicesComponent } from './services/services.component';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';

import { 
  NgxSwiperModule,
  NgxOptimizedImageModule
 } from '../../shared';

import { CoreModule } from '../../core';

@NgModule({
  declarations: [
    HomeComponent,
    SliderComponent,
    CompanyComponent,
    ServicesComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    NgxSwiperModule,
    NgxOptimizedImageModule,
    AngularSvgIconModule.forRoot(),
    CoreModule       
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeModule { }
