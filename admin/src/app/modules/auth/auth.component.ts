import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { LanguageService, TranslationService } from '../../core';

// const BODY_CLASSES = ['bgi-size-cover', 'bgi-position-center', 'bgi-no-repeat'];

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '<body[root]>',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit, OnDestroy {
  today: Date = new Date();
  currentLang: string | null = null;

  private unsubscribe: Subscription[] = [];
  
  constructor(
    // Services
    private translation: TranslationService,
    // Public
    public languageService: LanguageService
  ) {
    this.currentLang  = this.translation.getSelectedLanguage();
  }

  ngOnInit(): void {
    const sb = this.languageService.loadLanguages().pipe(
    ).subscribe();
    this.unsubscribe.push(sb);      
  }

  changeLanguage(lang: string): void {
    if (!lang) return;

    this.currentLang = lang;
    this.translation.setLanguage(lang);
  }
  
  ngOnDestroy(): void {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }  
}
