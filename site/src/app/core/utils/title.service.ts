import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TitleStrategy, RouterStateSnapshot } from '@angular/router';

import { SeoService } from './seo.service';

@Injectable({
  providedIn: 'root'
})
export class HelperTitleStrategy extends TitleStrategy {
  title = inject(Title);
  seo   = inject(SeoService);

  updateTitle(snapshot: RouterStateSnapshot): void {
    let title = this.buildTitle(snapshot) || '';
    if (!title) {
      title = 'DEFAULT_TITLE';
    }
    return this.seo.setPageTitle(title);      
    //this.title.setTitle(translatedTitle + app_name);
  }
  
}
