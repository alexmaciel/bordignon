import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Settings } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingService implements OnDestroy {

  // Public fields
  public currentSettingSubject$ = new BehaviorSubject<any>(undefined);
  settingSubject: BehaviorSubject<Settings>;

  get settingsValue(): Settings {
    return this.settingSubject.value;
  }

  set settingsValue(set: Settings) {
    this.settingSubject.next(set);
  }

  // Getters
  get settings$() {
    return this.currentSettingSubject$.asObservable();
  } 

  // private fields
  private unsubscribe: Subscription[] = [];

  protected http: HttpClient;
  // API URL has to be overrided
  API_URL = `${environment.apiUrl}/clients`;
  constructor(http: HttpClient) {
    this.http = http;   
    this.settingSubject = new BehaviorSubject<Settings | any>(undefined);

    const subscr = this.getSettings().subscribe(res => this.settingSubject.next(res));
    this.unsubscribe.push(subscr);    
  }

  getSettings(): Observable<Settings> { 
    return this.http.get<Settings>(`${this.API_URL}/settings`).pipe(
      map((response: Settings) => {
        if (response) {
          this.currentSettingSubject$.next(response);
        }
        return response;
      })
    );
  }   

  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }

}
