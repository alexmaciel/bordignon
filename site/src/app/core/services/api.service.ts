import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { 
  GroupingState,
  PaginatorState,
  SortState,
  APIResponseModel, 
  IAPIState, 
  BaseModel 
} from '../helpers';

import { environment } from '../../../environments/environment';

const DEFAULT_STATE: IAPIState = {
  filter: {},
  grouping: new GroupingState(),
  paginator: new PaginatorState(),
  sorting: new SortState(),
  product_id: 0,
  category_id: 0,
  search_string: '',
};

export abstract class ApiService<T> {

  // Public fields
  public _items$ = new BehaviorSubject<T[]>([]);
  private _isLoading$ = new BehaviorSubject<boolean>(false);
  private _isFirstLoading$ = new BehaviorSubject<boolean>(true);
  private _isApiState$ = new BehaviorSubject<IAPIState>(DEFAULT_STATE);
  private _errorMessage = new BehaviorSubject<string>('');
  private _subscriptions: Subscription[] = [];
    
  // Getters
  get items$() {
    return this._items$.asObservable();
  }
  get isLoading$() {
    return this._isLoading$.asObservable();
  }
  get isFirstLoading$() {
    return this._isFirstLoading$.asObservable();
  }
  get errorMessage$() {
    return this._errorMessage.asObservable();
  }
  get subscriptions() {
    return this._subscriptions;
  }
  // State getters
  get paginator() {
    return this._isApiState$.value.paginator;
  }
  get filter() {
    return this._isApiState$.value.filter;
  }
  get sorting() {
    return this._isApiState$.value.sorting;
  }
  get search_string() {
    return this._isApiState$.value.search_string;
  }
  get grouping() {
    return this._isApiState$.value.grouping;
  }


  protected http: HttpClient;
  // API URL has to be overrided
  API_URL = `${environment.apiUrl}/clients`;
  constructor(http: HttpClient) {
    this.http = http;
  }

  // READ (Returning filtered list of entities)
  find(APIState: IAPIState): Observable<APIResponseModel<T>> {
    const url = `${this.API_URL}/getAll`;
    this._errorMessage.next('');
    return this.http.post<APIResponseModel<T>>(url, APIState).pipe(
      catchError(err => {
        this._errorMessage.next(err);
        console.error('FIND ITEMS', err);
        return of({ items: [], total: 0 });
      })
    );
  }  

  getItemById(id: any): Observable<any> {
    this._isLoading$.next(true);
    this._errorMessage.next('');
    const url = `${this.API_URL}/getItemById/${id}`;
    return this.http.get<BaseModel>(url).pipe(
      catchError(err => {
        this._errorMessage.next(err);
        console.error('GET ITEM BY IT', id, err);
        return of({ id: undefined });
      }),
      finalize(() => this._isLoading$.next(false))
    );
  }    

  public fetch() {
    this._isLoading$.next(true);
    this._errorMessage.next('');
    const request = this.find(this._isApiState$.value)
    .pipe(
      tap((res: APIResponseModel<T>) => {
        this._items$.next(res.items);
        this.patchStateWithoutFetch({
          paginator: this._isApiState$.value.paginator.recalculatePaginator(
            res.total
          ),
        });        
      }),  
      catchError((err) => {
        this._errorMessage.next(err);
        return of({
          items: [],
          total: 0
        });
      }), 
      finalize(() => {
        this._isLoading$.next(false);
        const itemIds = this._items$.value.map((el: T) => {
          const item = (el as unknown) as BaseModel;
          return item.id;
        });
        this.patchStateWithoutFetch({
          grouping: this._isApiState$.value.grouping.clearRows(itemIds),
        });
      })            
    ) 
    .subscribe();
    this._subscriptions.push(request);
  }  

  public setDefaults() {
    this.patchStateWithoutFetch({ filter: {} });
    this.patchStateWithoutFetch({ search_string: '' });
    this.patchStateWithoutFetch({ category_id: 0 });
    this.patchStateWithoutFetch({ sorting: new SortState() });
    this.patchStateWithoutFetch({ grouping: new GroupingState() });
    this.patchStateWithoutFetch({
      paginator: new PaginatorState()
    })    
    this._isFirstLoading$.next(true);
    this._isLoading$.next(true);
    this._isApiState$.next(DEFAULT_STATE);
    this._errorMessage.next('');
  }

  // Base Methods
  public patchState(patch: Partial<IAPIState>) {
    this.patchStateWithoutFetch(patch);
    this.fetch();
  }

  public patchStateWithoutFetch(patch: Partial<IAPIState>) {
    const newState = Object.assign(this._isApiState$.value, patch);
    this._isApiState$.next(newState);
  }
}
