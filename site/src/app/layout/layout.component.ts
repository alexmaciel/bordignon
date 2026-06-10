import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { LayoutInitService } from './services/layout-init.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  // Public variables
  // page
  pageContainerCSSClasses!: string;
  // header
  appHeaderDefaultClass: string = '';  
  appHeaderDefaultContainer: 'fixed' | 'fluid' = 'fluid';
  headerContainerCssClass: string = '';
  appHeaderDefaultContainerClass: string = '';  
  // content
  appContentContainer?: 'fixed' | 'fluid' = 'fluid';
  appContentContainerClass!: string;
  contentCSSClasses!: string;
  contentContainerCSSClass!: string;  
  // newsletter
  appNewsletterContainer?: 'fixed' | 'fluid' = 'fluid';
  appNewsletterContainerCSSClass: string = '';  
  // footer
  appFooterContainer?: 'fixed' | 'fluid' = 'fixed';
  appFooterContainerCSSClass: string = '';

  constructor(
    private initService: LayoutInitService,
    private router: Router,
  ) {
    // define layout type and load layout
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.initService.reInitProps();
      }
    });    
  }
}
