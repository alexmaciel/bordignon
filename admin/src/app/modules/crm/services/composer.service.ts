import { Inject, Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { 
  AlertService,
  EmailService,
} from '../../../core';

@Injectable({
  providedIn: 'root'
})
export class ComposerService extends EmailService implements OnDestroy {
  
  override API_URL = `${environment.apiUrl}/crm/emails`;

  constructor(@Inject(HttpClient) http: HttpClient, private alert: AlertService) {
    super(http);
  }

  override send_email(data: any): Observable<any> {
    const url = `${this.API_URL}/send_email`;  
    console.log();  
    return this.http.post<any>(url, data).pipe(
      tap((response: any) => {
        if(response) {
          this.alert?.toast(response.alert?.type, response.alert?.message);
        }
      }),
      catchError(err => {
        console.error('UPDATE  LAUNCHING FOR ITEM', err);
        return of({type: 'error', message: 'unexpected error'});
      }),      
    );
  }     

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }    

}
