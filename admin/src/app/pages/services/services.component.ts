import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '@gilsdav/ngx-translate-router';


@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
})
export class ServicesComponent {
  
  constructor(
    private router: Router,
    // Services
    private localize: LocalizeRouterService,
  ) { }

  calculateMenuItemCssClass(url: string): string {
    const path: any = this.localize.translateRoute(url)
    return checkIsActive(this.router.url, path) ? 'active' : '';
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
