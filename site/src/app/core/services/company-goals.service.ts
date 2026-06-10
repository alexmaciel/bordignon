import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

import { 
  Goals 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class CompanyGoalService implements OnDestroy  {

  // Public fields
  public _items$ = new BehaviorSubject<Goals[]>([]);
  public _subscriptions: Subscription[] = [];

  // Getters
  get items$() {
    return this._items$.asObservable();
  }
  get subscriptions() {
    return this._subscriptions;
  }  

  protected http: HttpClient;
  // API URL has to be overrided
  API_URL = `${environment.apiUrl}/clients`;
  constructor(http: HttpClient) {
    this.http = http;
  }


  getGoals(): Observable<Goals[]> { 
    return this.http.get<Goals[]>(`${this.API_URL}/companyGoals`).pipe(
      map((response: Goals[]) => {
        if(response) {
          this._items$.next(response);
        }
        return response;
      }),
    );
  }   

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }  
}
