import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { SwiperOptions } from 'swiper/types';
import { 
  CompanyItemService,
  CompanyGalleryService,
  CompanyService,
  TeamService
} from '../../core';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  host: {'app-company-page': 'company-page'}
})
export class CompanyComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];

  constructor(
    // Services
    public company: CompanyService,
    public gallery: CompanyGalleryService,
    public items: CompanyItemService,
    public teams: TeamService,
  ) { }

  ngOnInit(): void {
    const sb = this.company.getCompany().pipe(
    ).subscribe();
    this.subscriptions.push(sb);   

    this.loadPictures();
    this.loadItems();
    this.loadTeams();
  }

  loadItems() {
    const sb = this.items.getItems().pipe(
    ).subscribe();
    this.subscriptions.push(sb);       
  }    

  loadPictures() {
    const sb = this.gallery.getCompanyGallery().pipe(
    ).subscribe();
    this.subscriptions.push(sb);       
  }  

  loadTeams() {
    const sb = this.teams.getTeam().pipe(
    ).subscribe();
    this.subscriptions.push(sb);      
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

  config: SwiperOptions = {
    slidesPerView: "auto",
    spaceBetween: 8,
    loop: false,
    grabCursor: true,
    keyboard: true,
    touchStartPreventDefault: true,
    pagination: {
      enabled: true,
      type: 'bullets',
      el: '.company-pagination'
    },         
    breakpoints: {
      '320': {
        spaceBetween: 8,
      },
      '768': {
        spaceBetween: 16,
      },
      '1024': {
        spaceBetween: 24
      }      
    }    
  }; 
}
