import { Injectable, Inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap} from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { 
  TableService, 
  ITableState, 
  TableResponseModel, 
  baseFilter,
  ApiModel, 
} from '../../../shared';

import { Services } from '../models/services.model';
import { AlertService } from '../../../core';

@Injectable({
  providedIn: 'root'
})
export class ServicesService extends TableService<Services> implements OnDestroy  {
  
  override API_URL = `${environment.apiUrl}/admin/services`;

  constructor(
    @Inject(HttpClient) http: HttpClient, alert: AlertService) {
    super(http, alert);
  }


  // READ
  override find(tableState: ITableState): Observable<TableResponseModel<Services>> {
    return this.http.get<Services[]>(`${this.API_URL}/getAll`).pipe(
      map((response: Services[]) => {
        const filteredResult = baseFilter(response, tableState);
        const result: TableResponseModel<Services> = {
          items: filteredResult.items,
          total: filteredResult.total
        };
        return result;
      })
    );
  }  

  override getItemById(id: number): Observable<Services> {
    const url = `${this.API_URL}/getItemById/${id}`;
    return this.http.get<Services>(url).pipe(
      map((response: Services) => {
        return response;
      }),
    );
  }     

  
  sortable(data: any[]): Observable<ApiModel> {
    const item = { data };
    const url = this.API_URL + '/sortable';    
    return this.http.post<ApiModel>(url, item).pipe(
      tap((response) => {
        this.alert?.toast(response.alert?.type, response.alert?.message);
      }),
      catchError((err) => {
        console.error('err', err);
        return of({ id: undefined } as ApiModel );
      }),      
    );
  }   

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }   
}
