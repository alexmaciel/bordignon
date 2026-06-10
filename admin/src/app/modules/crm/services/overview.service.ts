import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { map, finalize, catchError, tap } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';

import { Overview } from '../models';
import { ApiModel } from '../../../shared';

@Injectable({
  providedIn: 'root'
})
export class OverviewService implements OnDestroy {

  // Public fields
  public _items$ = new BehaviorSubject<any>(undefined);
  public _subscriptions: Subscription[] = [];
  public _isLoading$ = new BehaviorSubject<boolean>(false);

  private _errorMessage = new BehaviorSubject<string>('');

  // Getters
  get items$() {
    return this._items$.asObservable();
  }  
  get isLoading$() {
    return this._isLoading$.asObservable();
  }
  get errorMessage$() {
    return this._errorMessage.asObservable();
  }  
  get subscriptions() {
    return this._subscriptions;
  }

  protected http: HttpClient;
  // API URL has to be overrided
  API_URL = `${environment.apiUrl}/crm/overview`;
  constructor(http: HttpClient) {
    this.http = http;
  }

  getOverview(): Observable<Overview> {
    this._isLoading$.next(true);
    this._errorMessage.next('');    

    return this.http.get<Overview>(`${this.API_URL}`).pipe(
      tap((response: Overview) => {
        const result = response;
        if(result) {
          this._items$.next(result);
        }
      }),     
      catchError((err) => {
        console.error('err', err);
        return of();
      }),         
      finalize(() => this._isLoading$.next(false))
    );
  }  
  
  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }    
}