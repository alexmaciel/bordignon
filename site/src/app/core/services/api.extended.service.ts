import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ApiExtendedService extends ApiService<any> {
  constructor(@Inject(HttpClient) http: any) {
    super(http);
  }
}
