import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

import { Email } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SendmailService implements OnDestroy {

  // Public fields
  private _isLoading$ = new BehaviorSubject<boolean>(false);
  private _subscriptions: Subscription[] = [];

  // Getters
  get subscriptions() {
    return this._subscriptions;
  }  
  get isLoading$() {
    return this._isLoading$.asObservable();
  }  

  protected http: HttpClient;
  // API URL has to be overrided
  API_URL = `${environment.apiUrl}/clients`;
  constructor(http: HttpClient) {
    this.http = http;
  }
  
  // SEND
  sendEmail(sendmail: any): Observable<any> {
    this._isLoading$.next(true);
    return this.http.post<any>(`${this.API_URL}/send_email`, sendmail).pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        console.error('SEND ITEM', err);
        return of(undefined);
      }), 
      finalize(() => this._isLoading$.next(false))         
    );
  } 
  
  sendDownload(data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/download`, data).pipe(
      map((response) => {
        return response;
      }),      
      catchError(err => {
        console.error('SEND ITEM', err);
        return of(undefined);
      }),      
      finalize(() => {})      
    );
  }   
  
  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }   
}
