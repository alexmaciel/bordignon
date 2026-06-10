import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { 
  SocialService,
  Social,
} from '../../../core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  preserveWhitespaces: true
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() appHeaderDefaultContainer?: 'fixed' | 'fluid';
  @Input() appHeaderDefaultContainerClass: string = '';
  
  // Public props
  headerContainerCssClass: string = 'container-fluid';
  appHeaderDefaultFixedDesktop?: boolean = true;  

  social: Social[] = [];
  
  private unsubscribe: Subscription[] = [];
  
  constructor(
    // Services
    public socials: SocialService,
  ) { }

  ngOnInit(): void {
    this.loadSocial();
  }

  loadSocial() {
    const sb = this.socials.getSocial().subscribe();
    this.unsubscribe.push(sb) 
  }  

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }  
}
