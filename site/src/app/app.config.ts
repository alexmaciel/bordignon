import { ApplicationConfig, importProvidersFrom, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, RouteReuseStrategy, TitleStrategy, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withNoXsrfProtection } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';

import { 
  HelperTitleStrategy,
  JsonLdModule,
  CoreModule,
  CustomReuseStrategy, 
} from './core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    importProvidersFrom(
      CoreModule, 
      JsonLdModule
    ),       
    provideRouter(routes,
      withComponentInputBinding()
    ), 
    provideClientHydration(
      withHttpTransferCacheOptions({
      includePostRequests: true
    })),
    provideServiceWorker('ngsw-worker.js', {
        enabled: !isDevMode(),
        registrationStrategy: 'registerWhenStable:30000'
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy }, 
    { provide: TitleStrategy, useClass: HelperTitleStrategy },
    provideHttpClient(
      withFetch(),
      withNoXsrfProtection()
    ), 
  ]
};
