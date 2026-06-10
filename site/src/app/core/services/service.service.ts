import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

import { Services } from '../models/services.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceService implements OnDestroy {

  // Public fields
  public _items$ = new BehaviorSubject<Services[]>([]);
  // Private fields
  private _subscriptions: Subscription[] = [];

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

  // READ
  getServices(): Observable<Services[]> { 
    return this.http.get<Services[]>(`${this.API_URL}/services`).pipe(
      map((response: Services[]) => {
        if(response) {
          this._items$.next(response);
        }
        return response;
      }),
    );
  }  

  getServiceById(slug: string): Observable<Services> {
    const url = `${this.API_URL}/service/${slug}`;
    return this.http.get<Services>(url).pipe(
      map((response: Services) => {
        return response;
      }),
    );
  }     
   
  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }  
}
