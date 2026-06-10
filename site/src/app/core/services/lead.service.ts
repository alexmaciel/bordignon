import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class LeadService implements OnDestroy {

    private _isLoading$ = new BehaviorSubject<boolean>(false);
    // Public fields
    private _items$ = new BehaviorSubject<any[]>([]);
    // Private fields
    private _subscriptions: Subscription[] = [];

    // Getters
    get items$() {
        return this._items$.asObservable();
    }
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

    create(item: any): Observable<any> {
        const url = `${this.API_URL}/addLead`; 
        this._isLoading$.next(true);
        return this.http.post<any>(url, item).pipe(  
            map((response) => {
                return response;
            }),
            catchError(err => {
                console.error('CREATE ITEM', err);
                return of({ id: undefined });
            }),
            finalize(() => this._isLoading$.next(false))
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sb => sb.unsubscribe());
    }      
}