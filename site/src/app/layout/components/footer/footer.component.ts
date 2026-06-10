import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { 
  SettingService,
  SocialService,
} from '../../../core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  host: {ngSkipHydration: 'true'},
})
export class FooterComponent implements OnInit, OnDestroy {
  @Input() appFooterContainer?: 'fixed' | 'fluid';
  @Input() appFooterContainerCSSClass: string = '';
  
  isLoading: boolean = false;
  selectedCategory: number = 0;

  private unsubscribe: Subscription[] = [];

  constructor(
    // Services
    public settings: SettingService,  
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
