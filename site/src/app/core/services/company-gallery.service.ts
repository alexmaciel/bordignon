import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment'

import { Pictures } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CompanyGalleryService implements OnDestroy {

  // Public fields
  public _items$ = new BehaviorSubject<Pictures[]>([]);
  public _item$ = new BehaviorSubject<any>('');
  // Private fields
  private _subscriptions: Subscription[] = [];

  // Getters
  get items$() {
    return this._items$.asObservable();
  }
  get item$() {
    return this._item$.asObservable();
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
  getCompanyGallery(): Observable<Pictures[]> { 
    return this.http.get<Pictures[]>(`${this.API_URL}/companyPictures/`).pipe(
      map((response: Pictures[]) => {
        if(response) {
          this._items$.next(response);
        }
        return response;
      }),
      finalize(() => {})
    );
  } 

  getCompanyIndexGallery(): Observable<Pictures> { 
    return this.http.get<Pictures>(`${this.API_URL}/companyIndexPictures/`).pipe(
      map((response: Pictures) => {
        if(response) {
          this._item$.next(response);
        }
        return response;
      }),
      finalize(() => {})
    );
  } 

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  } 
}
