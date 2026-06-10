import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { NavigationCancel, NavigationEnd, NavigationError, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

import { 
  AnalyticsService,
  ApiExtendedService 
} from './core';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'bordignon & bordignon';

  private unsubscribe: Subscription[] = [];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router,
    // Services
    private ApiExtended: ApiExtendedService,
    private analytics: AnalyticsService,    
  ) { }
    
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const routerSubscription = this.router.events.subscribe((event) => {
        if (event instanceof NavigationError) {
          console.error('Router error:', event.error);
          this.router.navigate(['/error/500']);
        }
        
        if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
          // Trick the Router into believing it's last link wasn't previously loaded
          this.router.navigated = false;          
          // analytics track
          this.analytics.init();
          this.analytics.trackPageViews();
          // clear filtration paginations and others
          this.ApiExtended.setDefaults();           
          // scroll to top on every route change
          if (typeof document !== 'undefined') {
            // to display back the body content
            setTimeout(() => {
              document.body.classList.add('page-loaded');
              document.body.scrollTop = 0; // || window.scrollTo(0, 0);
            }, 100);         
          }        
        }
      });   
      this.unsubscribe.push(routerSubscription);  
    }
  }  

  ngOnDestroy() {
    this.unsubscribe.forEach((routerSubscription) => routerSubscription.unsubscribe());
  }   
}
