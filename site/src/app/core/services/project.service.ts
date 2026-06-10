import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { APIResponseModel, IAPIState, baseFilter } from '../helpers';

import { ApiService } from './api.service';
import { Project } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProjectService extends ApiService<Project> {

  override API_URL = `${environment.apiUrl}/clients`;

  constructor(@Inject(HttpClient) http: HttpClient) {
    super(http);
  }
  
  // READ
  override find(apiState: IAPIState | any): Observable<APIResponseModel<Project>> {
    const params: any = [];

    const filtrationFields = Object.keys(apiState);
    filtrationFields.forEach((keyName) => {
      params[keyName] = apiState[keyName];
    });
    
    return this.http.get<Project[]>(`${this.API_URL}/projects`, { params }).pipe(
      map((response: Project[]) => {
        const filteredResult = baseFilter(response, apiState);
        const result: APIResponseModel<Project> = {
          items: filteredResult.items,
          total: filteredResult.total
        };
        return result;
      })
    );
  }  

  override getItemById(slug: string): Observable<Project> {
    const url = `${this.API_URL}/getProjectBySlug/${slug}`;
    return this.http.get<Project>(url).pipe(
      map((response: Project) => {
        return response;
      }),
    );
  }      
  
}
