import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

import { Categories } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService implements OnDestroy {

  // Public fields
  public _items$ = new BehaviorSubject<Categories[]>([]);
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
  getCategories(): Observable<Categories[]> { 
    return this.http.get<Categories[]>(`${this.API_URL}/categories`).pipe(
      map((response: Categories[]) => {
        if(response) {
          this._items$.next(response);
        }
        return response;
      }),
    );
  }  

  getCategoryById(id?: number): Observable<Categories> {
    const url = `${this.API_URL}/category/${id}`;
    return this.http.get<Categories>(url).pipe(
      map((response: Categories) => {
        return response;
      }),
    );
  }     
   
  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }  
}
