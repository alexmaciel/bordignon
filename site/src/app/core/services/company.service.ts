import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

import { Company, Pictures } from '../models/';

@Injectable({
  providedIn: 'root'
})
export class CompanyService implements OnDestroy  {

  // Public fields
  public _items$ = new BehaviorSubject<any>(undefined);
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

  getCompany(): Observable<Company> { 
    return this.http.get<Company>(`${this.API_URL}/company`).pipe(
      map((response: Company) => {
        if(response) {
          this._items$.next(response);
        }
        return response;
      }),
    );
  } 

  getPictures(): Observable<Pictures[]> { 
    return this.http.get<Pictures[]>(`${this.API_URL}/companyPictures`).pipe(
      map((response: Pictures[]) => {
        return response;
      }),
    );
  }   

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }  
}
