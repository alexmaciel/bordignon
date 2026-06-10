import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, of, Subscription, switchMap, take } from 'rxjs';
import { DOCUMENT } from '@angular/common';

import { SwiperOptions } from 'swiper/types';

import { 
  JsonLdService,
  SeoService,
  ServiceService,
  Services 
} from '../../../core';

@Component({
  selector: 'app-service-details',
  templateUrl: './service-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceDetailsComponent implements OnInit, OnDestroy {
  slug: string | undefined;
  services: Services | undefined;

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,  
    private cdr: ChangeDetectorRef,
    // Services
    public serviceService: ServiceService,
    // seo
    private readonly seo: SeoService,
    private readonly jsonLdService: JsonLdService,
    @Inject(DOCUMENT) private document: any,       
  ) { } 

  ngOnInit(): void {
    this.loadServices();

    const sb = this.route.paramMap.pipe(
      take(1),
      switchMap(params => {
        // get id from URL
        this.slug = String(params.get('slug'));
        if (this.slug || this.slug != '') {
          return this.serviceService.getServiceById(this.slug);
        }
        return of(undefined);
      }),
      finalize(() => {
        this.cdr.markForCheck();        
      })         
    ).subscribe((res) => {
      if (!res) {
        this.router.navigate(['/servicos'], { relativeTo: this.route });
      }

      this.services = res as Services;
      this.loadSeo();
      //this.cdr.detectChanges();
    });
    this.subscriptions.push(sb);        
  }

  loadServices() {
    const sb = this.serviceService.getServices().pipe(
    ).subscribe();
    this.subscriptions.push(sb);    
  }

  loadSeo() {
    // SEO
    this.seo.setData({
      title: this.services?.name,
      description: this.services?.description,
      //image: this.services?.pictures.length > 0 ? this.services?.pictures[0].thumb : ''
    });
    const jsonLd = this.jsonLdService.getObject('Website', {
      name: this.services?.name,
      url: this.document.location.origin + this.document.location.pathname
    });        
    this.jsonLdService.setData(jsonLd);    
  }     

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  } 

  config: SwiperOptions = {  
    slidesPerView: 'auto', 
    spaceBetween: 0,   
    loop: false,
    freeMode: {
      enabled: true
    },  
    keyboard: true,
    grabCursor: true,
    pagination: false,
  };    
}
