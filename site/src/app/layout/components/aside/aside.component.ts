import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { 
  SocialService,
  SettingService,
  Social,
  Settings
} from '../../../core';

@Component({
  selector: 'app-aside',
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.scss'],
})
export class AsideComponent implements OnInit, OnDestroy {

  settings$!: Observable<Settings>;
  social: Social[] = [];
  
  private unsubscribe: Subscription[] = [];
  
  constructor(
    private router: Router,   
    // Services
    public settings: SettingService, 
    public socialService: SocialService,
  ) { }

  ngOnInit(): void {
    this.loadSocial();
  }

  loadSocial() {
    const sb = this.socialService.getSocial().subscribe();
    this.unsubscribe.push(sb) 
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  calculateMenuItemCssClass(url: string): string {
    return checkIsActive(this.router.url, url) ? 'active' : '';
  }  
}

const getCurrentUrl = (pathname: string): string => {
  return pathname.split(/[?#]/)[0];
};

const checkIsActive = (pathname: string, url: string) => {
  const current = getCurrentUrl(pathname);
  if (!current || !url) {
    return false;
  }
  if (current === url) {
    return true;
  }
  if (current.indexOf(url) > -1) {
    return true;
  }
  return false;
};