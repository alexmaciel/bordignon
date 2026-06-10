import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}


@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private tagId = environment.appGoogleTagId;

  private loaded = false;
  private trackingPageViews = false;
  private lastPagePath = '';


  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router
  ) {}

  init(tagId: string = this.tagId): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
        
    if (!tagId || this.loaded) {
      return;
    }

    this.tagId = tagId;
    window.dataLayer = window.dataLayer || [];

    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tagId)}`;  
    
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', tagId, {
      send_page_view: false
    });

    this.loaded = true;    
  }

  trackPageViews() {
    if (!this.loaded || !window.gtag) {
      return;
    }

    this.trackingPageViews = true;
    this.trackPageView(this.router.url);    

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map((event: NavigationEnd) => event.urlAfterRedirects),
        distinctUntilChanged()
      )
      .subscribe((url: string) => {
        this.trackPageView(url);
    });
  }

  trackPageView(path: string): void {
    if (!this.canTrack() || !path || path === this.lastPagePath) {
      return;
    }

    this.lastPagePath = path;

    window.gtag('config', this.tagId, {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title
    });
  }  

  trackEvent(eventName: string, params?: Record<string, any>): void {
    if (!this.canTrack()) {
      return;
    }

    window.gtag('event', eventName, params || {});
  }

  private canTrack(): boolean {
    return (
      isPlatformBrowser(this.platformId) &&
      this.loaded &&
      !!this.tagId &&
      typeof window.gtag === 'function'
    );
  }  
}
