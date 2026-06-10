import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {
  GroupingState,
  PaginatorState,
  SortState,
  IDeleteAction,
  IDeleteSelectedAction,
  IUpdateStatusForSelectedAction,
  ISortView,
  IFilterView,
  IGroupingView,
  ISearchView,
} from '../../../../shared';

import { ClientsService } from '../../services';
// components
//import { StatusComponent } from './actions/status/status.component';
import { EditClientsComponent } from '../actions/edit/edit.component';
import { DeleteClientComponent } from '../actions/delete/delete.component';
import { DeleteClientSelectedComponent } from '../actions/delete-selected/delete-selected.component';

import { ExportAsConfig, SupportedExtensions } from '../../models';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
})
export class ClientsListComponent 
  implements 
  OnInit, 
  OnDestroy,
  IDeleteAction,
  IDeleteSelectedAction,
  IUpdateStatusForSelectedAction,
  ISortView,
  IFilterView,
  IGroupingView,
  ISearchView {

  paginator!: PaginatorState;
  sorting!: SortState;
  grouping!: GroupingState;
  
  isLoading: boolean = false;

  filterGroup!: FormGroup;
  searchGroup!: FormGroup;  

  active: number = 0;

  
  config: ExportAsConfig = {
    type: 'xlsx',
    elementIdOrContent: 'clientes',
    options: {
      //pdfCallbackFn: this.pdfCallbackFn // to add header and footer
    }
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    // Services
    public clients: ClientsService,   
  ) { }

  ngOnInit(): void {
    this.filterForm();
    this.searchForm();

    const sb = this.clients.isLoading$.subscribe(res => this.isLoading = res);
    this.subscriptions.push(sb);
    this.grouping = this.clients.grouping;
    this.paginator = this.clients.paginator;
    this.sorting = this.clients.sorting;
    this.sorting.column = 'company';
    this.clients.fetch();    
  }

  // filtration
  filterForm() {
    this.filterGroup = this.fb.group({
      active: [''],
      searchTerm: [''],
    });
    this.subscriptions.push(
      this.filterGroup.controls['active'].valueChanges.subscribe(() =>
        this.filter()
      )
    );
  }

  filter() {
    const filter: any = {};
    const active = this.filterGroup.get('active')?.value;
    if (active) {
      filter['active'] = active;
    }

    this.clients.patchState({ filter });
  }  
  
  // search
  searchForm() {
    this.searchGroup = this.fb.group({
      search_string: [''],
    });
    const searchEvent = this.searchGroup.controls['search_string'].valueChanges
      .pipe(
        /*
        The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator,
        we are limiting the amount of server requests emitted to a maximum of one every 150ms
        */
        debounceTime(150),
        distinctUntilChanged()
      )
    .subscribe((val) => this.search(val));
    this.subscriptions.push(searchEvent);
  }

  search(search_string: string) {
    this.clients.patchState({ search_string });
  }  

  // sorting
  sort(column: string) {
    const sorting = this.sorting;
    const isActiveColumn = sorting.column === column;
    if (!isActiveColumn) {
      sorting.column = column;
      sorting.direction = 'asc';
    } else {
      sorting.direction = sorting.direction === 'asc' ? 'desc' : 'asc';
    }
    this.clients.patchState({ sorting });
  }  

  // pagination
  paginate(paginator: PaginatorState) {
    this.clients.patchState({ paginator });
  }    

  // actions
  create() {
    const modalRef = this.modalService.open(EditClientsComponent, { size: 'lg' });
    modalRef.result.then(
      () => this.clients.fetch(),
      () => { }
    );    
  }  

  delete(id: number) {
    const modalRef = this.modalService.open(DeleteClientComponent);
    modalRef.componentInstance.id = id;
    modalRef.result.then(
      () => this.clients.fetch(),
      () => { }
    );
  }

  deleteSelected() {
    const modalRef = this.modalService.open(DeleteClientSelectedComponent);
    modalRef.componentInstance.ids = this.grouping.getSelectedRows();
    modalRef.result.then(
      () => this.clients.fetch(),
      () => { }
    );       
  }  

  changeStatus(ev: any){
    const ids = ev.target.value;
    const checked = ev.target.checked;
    this.active = checked == true ? 0 : 1;
    
    //this.isLoading = true;
    const sb = this.clients.updateStatusForItems([ids], +this.active).pipe(
    ).subscribe();
    this.subscriptions.push(sb);      
  }    

  updateStatus(id: number[]) {
    const modalRef = this.modalService.open('', {size: 'lg'});
    modalRef.componentInstance.ids = Array.from(id);
    modalRef.result.then(
      () => this.clients.fetch(),
      () => { }
    );
  }  

  updateStatusForSelected() {
    const modalRef = this.modalService.open('', {size: 'lg'});
    modalRef.componentInstance.ids = this.grouping.getSelectedRows();
    modalRef.result.then(
      () => this.clients.fetch(),
      () => { }
    );
  }  

  exportAs(type: SupportedExtensions, opt?: string) {
    this.config.type = type;
    //this.exportService.save(this.config, 'clientes').subscribe();    
  }    

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }   
}
