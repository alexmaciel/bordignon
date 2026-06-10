import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { SeoService } from './seo.service';
import { JsonLdService } from './json-ld';

@Injectable({
  providedIn: 'root'
})
export class HelperService implements OnDestroy {

  private unsubscribe: Subscription[] = [];
  
  constructor(
    private readonly jsonLdService: JsonLdService,
    private readonly seo: SeoService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
  ) {
    this.setupRouting();
  }
  
  private setupRouting() {
    const routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter(route => route.outlet === 'primary')
      ).subscribe((route: ActivatedRoute) => {
      // set your meta tags & title here
      const title = route.snapshot.data['title'];
     // const translate = route.snapshot.data['translate'];
      this.seo.setPageTitle(title);   
      const jsonLd = this.jsonLdService.getObject('Website', {
        name: title,
        url: this.router.routerState.snapshot.url
      });   
      this.jsonLdService.setData(jsonLd);    
    });
    this.unsubscribe.push(routerSubscription);
  }  

  ngOnDestroy() {
    this.unsubscribe.forEach((routerSubscription) => routerSubscription.unsubscribe());
  }   
}
