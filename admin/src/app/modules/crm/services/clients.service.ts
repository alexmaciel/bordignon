import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';

import { AlertService } from '../../../core';
import { 
  TableService, 
  TableResponseModel, 
  ITableState, 
  baseFilter,
  ApiModel,
} from '../../../shared';

import { Clients } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ClientsService extends TableService<Clients> {

  override API_URL = `${environment.apiUrl}/crm/clients`;

  constructor(
    @Inject(HttpClient) http: HttpClient, alert: AlertService) {
    super(http, alert);
  }

  // READ
  override find(tableState: ITableState): Observable<TableResponseModel<Clients>> {
    return this.http.get<Clients[]>(`${this.API_URL}/getAll`).pipe(
      map((response: Clients[]) => {
        const filteredResult = baseFilter(response, tableState);
        const result: TableResponseModel<Clients> = {
          items: filteredResult.items,
          total: filteredResult.total
        };
        return result;
      })
    );
  }  

  override getItemById(id: number): Observable<Clients> {
    const url = `${this.API_URL}/getItemById/${id}`;
    return this.http.get<Clients>(url).pipe(
      map((response: Clients) => {
        return response;
      }),
    );
  }      
  
  
  deletePicture(id: number): Observable<ApiModel> {
    const url = `${this.API_URL}/deletePicture/${id}`;
    return this.http.delete(url).pipe(
      tap((response: ApiModel) => {
        if(response) {
          this.alert?.toast(response.alert?.type ?? '', response.alert?.message ?? '');
        }
        return response;
      }),   
      catchError((err) => {
        this.alert?.toast(err?.type ?? 'error', err?.message ?? '');
        console.error('err', err);
        return of({ id: undefined } as ApiModel );
      }),           
    );
  }  

}
