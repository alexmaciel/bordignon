import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subscription, of } from 'rxjs';
import { finalize, tap, catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

import { AlertService } from './alert.service';
import { 
  Languages, 
} from '../models';


@Injectable({
  providedIn: 'root'
})
export class LanguageService implements OnDestroy {
  private readonly STORAGE_KEY = 'app_lang';
  
  // private fields
  private _currentLanguage$ = new BehaviorSubject<string | null>(null);
  private _languages$ = new BehaviorSubject<Languages[]>([]);
  
  private _isLoading$ = new BehaviorSubject<boolean>(false);
  private _errorMessage = new BehaviorSubject<string>('');
  private _subscriptions: Subscription[] = [];

  // Public fields

  // Getters
  get language$() {
    return this._languages$.asObservable();
  } 
  get currentLanguage$() {
    return this._currentLanguage$.asObservable();
  } 
  get currentLanguageValue(): string | null {
    return this._currentLanguage$.value;
  }

  get isLoading$() {
    return this._isLoading$.asObservable();
  }  
  get errorMessage$() {
    return this._errorMessage.asObservable();
  }   
  get subscriptions() {
    return this._subscriptions;
  }  

  protected http: HttpClient;
  // API URL has to be overrided
  API_URL = `${environment.apiUrl}/languages`;
  constructor(http: HttpClient, private alert: AlertService) {
    this.http = http;        
    
    const saved = localStorage.getItem(this.STORAGE_KEY);
    this._currentLanguage$.next(saved ?? null);    
  }

  loadLanguages(): Observable<Languages[]> {
    this._isLoading$.next(true);
    this._errorMessage.next('');

    return this.http.get<Languages[]>(`${this.API_URL}`).pipe(
      tap((response) => {
        this._languages$.next(response || []);

        if (!this._currentLanguage$.value) {
          // default vindo da API; senão pega o primeiro; senão 'portuguese'
          const fallback = response?.find(l => l.isDefault)?.code || response?.[0]?.code ||
            'portuguese';
          this.setLanguage(fallback);
        }
      }),
      catchError(err => {
        this._errorMessage.next(err);
        console.error('[Language] fetchLanguages error', err);
        this._languages$.next([]);
        return of([]);
      }),
      finalize(() => this._isLoading$.next(false))
    );
  }  


  setLanguage(lang: string): Observable<any> {
    this._isLoading$.next(true);
    this._errorMessage.next('');      
    const url = `${this.API_URL}/change_language`;
    return this.http.post(url, { lang }).pipe(
      map((response: any) => {
        if (response) {
          this.alert?.toast(
            response.alert?.type ?? 'success',
            response.alert?.message ?? ''
          );
        }

        const language = response?.language ?? lang;

        this._currentLanguage$.next(language);
        if (language) localStorage.setItem(this.STORAGE_KEY, language);
        else localStorage.removeItem(this.STORAGE_KEY);

        return response;
      }),    
      catchError((err) => {
        const alert = err?.error?.alert ?? {
          type: 'error',
          title: 'validation_error',
          message: err?.message || 'Unexpected failed.',
        };
        this._errorMessage.next(err);
        this.alert?.toast(alert.type, alert.message);        
        console.error('err', lang, err);
        return of({type: 'error', message: alert.message});
      }),        
      finalize(() => this._isLoading$.next(false))   
    ); 
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }  
}
