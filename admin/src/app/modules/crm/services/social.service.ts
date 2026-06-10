import { Injectable, Inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';

import { 
  TableService, 
  TableResponseModel, 
  ITableState, 
  baseFilter,
  ApiModel,
} from '../../../shared';

import { Social } from '../models';
import { AlertService } from '../../../core';

@Injectable({
  providedIn: 'root'
})
export class SocialService extends TableService<Social> implements OnDestroy {

  override API_URL = `${environment.apiUrl}/crm/clients`;

  constructor(
    @Inject(HttpClient) http: HttpClient, alert: AlertService) {
    super(http, alert);
  }

  // READ
  override find(tableState: ITableState): Observable<TableResponseModel<Social>> {
    return this.http.get<Social[]>(`${this.API_URL}/getSocial`).pipe(
      map((response: Social[]) => {
        const filteredResult = baseFilter(response.filter(el => el.clientid === tableState.userid), tableState);
        const result: TableResponseModel<Social> = {
          items: filteredResult.items,
          total: filteredResult.total
        };
        return result;
      })
    );
  }  

  override getItemById(id: number): Observable<Social> {
    const url = `${this.API_URL}/getSocial/${id}`;
    return this.http.get<Social>(url).pipe(
      map((response: Social) => {
        return response;
      })
    );
  }  

  addSocial(item: Social): Observable<ApiModel> {
    const url = `${this.API_URL}/addSocial`; 
    return this.http.post<Social>(url, item).pipe(  
      tap((response: ApiModel) => {
        if(response) {
          this.alert?.toast(response.alert?.type, response.alert?.message);
        }
      }),
      catchError(err => {
        console.error('CREATE SOCIAL', err);
        return of({ id: undefined });
      }),
    );
  }  

  updateSocial(social: Social): Observable<ApiModel> {
    const url = `${this.API_URL}/updateSocial/${social.id}`;
    return this.http.put(url, social).pipe(
      tap((response: ApiModel) => {
        if(response) {
          this.alert?.toast(response.alert?.type, response.alert?.message);
        }
      }),
      catchError(err => {
        console.error('UPDATE SOCIAL', social, err);
        return of(social);
      }),
    );
  }  

  sortableSocial(data: ApiModel[]): Observable<ApiModel> {
    const item = { data };
    const url = this.API_URL + '/sortableSocial';    
    return this.http.post(url, item).pipe(
      tap((item: ApiModel) => {
        return item;
      }),   
      catchError((err) => {
        console.error('err', err);
        return of({type: 'error', message: 'unexpected error'} as ApiModel);
      }),        
    );
  }    

  deleteSocial(id: number): Observable<any> {
    const url = `${this.API_URL}/deleteSocial/${id}`;
    return this.http.delete(url).pipe(
      map((response: ApiModel) => {
        this.alert?.toast(response.alert?.type, response.alert?.message);
        return response;
      }),  
      catchError((err) => {
        this.alert?.toast(err?.type ?? 'error', err?.message ?? '');
        console.error('err', err);
        return of({ id: undefined } as ApiModel );
      }),        
    );
  }    
  
  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }  

}
