import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KeeniconModule } from '../keenicon';

import { NgxDropzoneComponent } from './ngx-dropzone.component';
import { NgxDropzoneDirective } from './ngx-dropzone.directive';

import { 
  NGXDROPZONE_CONFIG,
  NGXDropzoneConfigInterface 
} from './ngx-dropzone.interfaces';

const DEFAULT_DROPZONE_CONFIG: NGXDropzoneConfigInterface = {
  // Change this to your upload POST address:
  acceptedFiles: 'image/*',
};

@NgModule({
  imports: [CommonModule, KeeniconModule],
  declarations: [NgxDropzoneComponent, NgxDropzoneDirective],
  exports: [CommonModule, NgxDropzoneComponent, NgxDropzoneDirective],
  providers: [
    {
      provide: NGXDROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG
    }
  ]  
})
export class NGXDropzoneModule {
}
