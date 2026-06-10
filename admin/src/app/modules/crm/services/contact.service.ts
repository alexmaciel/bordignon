import { Injectable, Inject, OnDestroy } from '@angular/core';
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

import { Contacts } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ContactService extends TableService<Contacts> {

  override API_URL = `${environment.apiUrl}/crm/contacts`;

  constructor(
    @Inject(HttpClient) http: HttpClient, alert: AlertService) {
    super(http, alert);
  }

  // READ
  override find(tableState: ITableState): Observable<TableResponseModel<Contacts>> {
    return this.http.get<Contacts[]>(`${this.API_URL}/getAll`).pipe(
      map((response: Contacts[]) => {
        const filteredResult = baseFilter(response, tableState);
        const result: TableResponseModel<Contacts> = {
          items: filteredResult.items,
          total: filteredResult.total
        };
        return result;
      })
    );
  }  

  getClientTable(id: number): Observable<Contacts[]> {
    const url = `${this.API_URL}/getClientTable/${id}`;
    return this.http.get<Contacts[]>(url).pipe(
      tap((response: Contacts[]) => {
        return response;
      }),
      catchError((err) => {
        console.error('err', err);
        return of([]);
      }),       
    );
  }     
   
  getContactByClientId(userid: number): Observable<Contacts[]> {
    const url = `${this.API_URL}/getContactByClientId/${userid}`;
    return this.http.get<Contacts[]>(url).pipe(
      tap((response: Contacts[]) => {
        return response;
      }),
      catchError((err) => {
        console.error('err', err);
        return of([] as Contacts[]);
      }),        
    );
  }    

  deletePicture(id: number): Observable<any> {
    const url = `${this.API_URL}/deletePicture/${id}`;
    return this.http.delete(url).pipe(
      tap((response: any) => {
        if (response) {
          this.alert?.toast(response.alert?.type, response.alert?.message);
        }
      }), 
      catchError((err) => {
        this.alert?.toast(err?.type ?? 'error', err?.message ?? '');
        console.error('err', err);
        return of({ id: undefined } as ApiModel );
      }),            
    );
  }  

}
