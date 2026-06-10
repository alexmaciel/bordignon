import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SwiperComponent } from './swiper.component';

@NgModule({
  declarations: [
    SwiperComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SwiperComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NgxSwiperModule { }
