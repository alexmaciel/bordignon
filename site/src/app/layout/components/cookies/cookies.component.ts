import { AfterViewInit, Component, ElementRef, Inject, NgZone, OnDestroy, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { CookieService } from 'ngx-cookie-service';

import { AnalyticsConsentService } from './analytics-consent.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-cookies',
  templateUrl: './cookies.component.html',
  standalone: true,
  imports: [
    CommonModule,
  ]  
})
export class CookiesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('wrapper',   { static: true }) wrapper!: ElementRef<HTMLElement>;
  @ViewChild('acceptBtn', { static: true }) acceptBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('rejectBtn', { static: true }) rejectBtn!: ElementRef<HTMLButtonElement>;

  @ViewChild('okBtn',     { static: true }) okBtn!: ElementRef<HTMLButtonElement>;

  private _isBrowser = false;
  private removeClickListener?: () => void;
  
  private removeAcceptListener?: () => void;
  private removeRejectListener?: () => void;  

  private tagId = environment.appGoogleTagId;

  constructor(
    private renderer: Renderer2,
    private cookieService: CookieService,
    private analytics: AnalyticsConsentService,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this._isBrowser = isPlatformBrowser(this.platformId);
  }

  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (this._isBrowser) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }   

  ngAfterViewInit(): void {
    this.browserOnly(() => {
      const consent = this.cookieService.get('_bordignon');

      if (consent === 'accepted') {
        this.analytics.enableGA4(this.tagId);
        
        this.renderer.setStyle(this.wrapper.nativeElement, 'opacity', '0');
        this.renderer.setStyle(this.wrapper.nativeElement, 'visibility', 'hidden');        
        return;
      }

      if (consent === 'rejected') {
        this.analytics.disableGA4();
         
        return;
      }

      // Mostrar o banner
      this.renderer.setStyle(this.wrapper.nativeElement, 'opacity', '1');
      this.renderer.setStyle(this.wrapper.nativeElement, 'visibility', 'visible');
      this.renderer.setStyle(this.wrapper.nativeElement, 'transition', '0.2s linear');

      // Registrar evento com cleanup
      this.removeAcceptListener = this.renderer.listen(
        this.acceptBtn.nativeElement,
        'click',
        (e: Event) => this.handleConsent(e, true)
      );

      this.removeRejectListener = this.renderer.listen(
        this.rejectBtn.nativeElement,
        'click',
        (e: Event) => this.handleConsent(e, false)
      );
    });
  }

  private handleConsent(e: Event, accepted: boolean) {
    e.preventDefault();

    const value = accepted ? 'accepted' : 'rejected';

    this.cookieService.set('_bordignon', value, {
      expires: 15,
      sameSite: 'Lax',
      path: '/',
      //domain: environment.appGoogleTagId,
    });   

    this.renderer.setStyle(this.wrapper.nativeElement, 'opacity', '0');
    setTimeout(() => {
      this.renderer.setStyle(this.wrapper.nativeElement, 'visibility', 'hidden');
    }, 200);    
 
    if (accepted && this.tagId) {
      // Use seus IDs reais:
      this.analytics.enableGA4(this.tagId);                 // GA4
      //this.analytics.enableMetaPixel('123456789012345');  // Meta Pixel
    } else {
      // Garante que nada dispare após rejeição
      this.analytics.disableGA4();
      //this.analytics.disableMetaPixel();
    } 
  }  


  ngOnDestroy(): void {
    this.browserOnly(() => {
      if (this.removeAcceptListener) this.removeAcceptListener();
      if (this.removeRejectListener) this.removeRejectListener();
    });
  } 
}
