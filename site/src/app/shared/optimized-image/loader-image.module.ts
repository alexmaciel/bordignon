import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage, IMAGE_LOADER, ImageLoaderConfig, IMAGE_CONFIG } from '@angular/common';

import { environment } from '../../../environments/environment';

// The origin of the CDN we are going to use to pull images from.
// const base = 'https://images.unsplash.com';

const customLoader = (config: ImageLoaderConfig) => {
  // Join the value that the user put in the `ngSrc` attribute and the CDN base into a single URL.
  const url = new URL(config.src, `${environment.appUrl}`);

  if (config.width) {
    url.searchParams.set('w', config.width.toString());
  }

  if (config.loaderParams?.['compression']) {
    url.searchParams.set('q', config.loaderParams['compression']);
  }

  return url.toString();

};

@NgModule({
  imports: [
    CommonModule,
    NgOptimizedImage
  ],
  exports: [
    NgOptimizedImage
  ],
  // Configure the loader using the `IMAGE_LOADER` token.
  providers: [
    {
      provide: IMAGE_LOADER,
      useValue: customLoader
    },
    {
      provide: IMAGE_CONFIG,
      useValue: {
        breakpoints: [380, 640, 1200, 1920, 2048, 3840],
        disableImageSizeWarning: true,
        placeholderResolution: 40
      }
    },    
  ],   
})
export class NgxOptimizedImageModule { }
