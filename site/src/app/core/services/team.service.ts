import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

import { Team } from '../models/team.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService implements OnDestroy {

  // Public fields
  public _items$ = new BehaviorSubject<Team[]>([]);
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
  getTeam(): Observable<Team[]> { 
    return this.http.get<Team[]>(`${this.API_URL}/teams`).pipe(
      map((response: Team[]) => {
        const result = response as Team[];
        if(result) {
          this._items$.next(result);
        }
        return result;
      })
    );
  } 

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }    
 
}
