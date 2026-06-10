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

import { AlertService } from '../../../core';
import { Leads, Sources } from '../models';

@Injectable({
  providedIn: 'root'
})
export class LeadService extends TableService<Leads> {

  override API_URL = `${environment.apiUrl}/crm/leads`;

  constructor(
    @Inject(HttpClient) http: HttpClient, alert: AlertService) {
    super(http, alert);
  }

  // READ
  override find(tableState: ITableState): Observable<TableResponseModel<Leads>> {
    return this.http.get<Leads[]>(`${this.API_URL}/getTable`).pipe(
    map((response: Leads[]) => {
        const filteredResult = baseFilter(response, tableState);
        const result: TableResponseModel<Leads> = {
          items: filteredResult.items,
          total: filteredResult.total
        };
        return result;
      })
    );
  }  

  override getItemById(id: number): Observable<Leads> {
    const url = `${this.API_URL}/getItemById/${id}`;
    return this.http.get<Leads>(url).pipe(
    map((response: Leads) => {
        return response;
      }),
    );
  }    

  getSources(): Observable<Sources[]> {
    const url = `${this.API_URL}/sources/`;
    return this.http.get<Sources[]>(url).pipe(
      tap((response: Sources[]) => {
        return response;
      }),
      catchError((err) => {
        console.error('err', err);
        return of([]);
      }),          
    );
  }       

  convert_to_customer(lead: Leads): Observable<ApiModel> {
    const url = `${this.API_URL}/convert_to_customer/${lead.id}`;
    return this.http.put(url, lead).pipe(
      tap((response: ApiModel) => {
        if(response) {
          this.alert?.toast(response.alert?.type, response.alert?.message);
        }
      }),
      catchError(err => {
        console.error('UPDATE  LAUNCHING FOR ITEM', lead, err);
        return of({type: 'error', message: 'unexpected error'} as ApiModel);
      }),
    );
  } 	     
}     