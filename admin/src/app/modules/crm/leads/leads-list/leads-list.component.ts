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
  ISortView,
  IFilterView,
  IGroupingView,
  ISearchView,
} from '../../../../shared';

import { LeadService } from '../../services';
import { Sources } from '../../models';

// components
import { LeadsEditComponent } from '../leads-edit/leads-edit.component';
import { LeadsDeleteComponent } from '../leads-delete/leads-delete.component';
import { LeadsDeleteSelectedComponent } from '../leads-delete-selected/leads-delete-selected.component';


@Component({
  selector: 'app-leads-list',
  templateUrl: './leads-list.component.html',
})
export class LeadsListComponent
  implements 
  OnInit, 
  OnDestroy,
  IDeleteAction,
  IDeleteSelectedAction,
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

  sources: Sources[] = [];
  
  active: number = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    // Services
    public leads: LeadService,    
  ) { }

  ngOnInit(): void {
    this.filterForm();
    this.searchForm();
    this.loadSource();

    const sb = this.leads.isLoading$.subscribe(res => this.isLoading = res);
    this.subscriptions.push(sb);
    this.grouping = this.leads.grouping;
    this.paginator = this.leads.paginator;
    this.sorting = this.leads.sorting;
    this.sorting.column = 'name';
    this.leads.fetch();    
  }

  // filtration
  filterForm() {
    this.filterGroup = this.fb.group({
      source: [''],
      search_string: [''],
    });
    this.subscriptions.push(
      this.filterGroup.controls['source'].valueChanges.subscribe(() =>
        this.filter()
      )
    );
  }

  filter() {
    const filter: any = {};
    const source = this.filterGroup.get('source')?.value;
    if (source) {
      filter['source'] = source;
    }

    this.leads.patchState({ filter });
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
    this.leads.patchState({ search_string });
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
    this.leads.patchState({ sorting });
  }  

  // pagination
  paginate(paginator: PaginatorState) {
    this.leads.patchState({ paginator });
  }  

  // form actions
  create() {
    this.edit(0);
  }

  edit(id: number) {
    const modalRef = this.modalService.open(LeadsEditComponent, { size: 'lg' });
    modalRef.componentInstance.id = id;
    modalRef.result.then(
      () => this.leads.fetch(), 
      () => { }
    );
  }

  delete(id: number) {
    const modalRef = this.modalService.open(LeadsDeleteComponent);
    modalRef.componentInstance.id = id;
    modalRef.result.then(
      () => this.leads.fetch(),
      () => { }
    );
  }  

  deleteSelected() {
    const modalRef = this.modalService.open(LeadsDeleteSelectedComponent);
    modalRef.componentInstance.ids = this.grouping.getSelectedRows();
    modalRef.result.then(
      () => this.leads.fetch(),
      () => { }
    );       
  }  
  
  loadSource() {
    const sb = this.leads.getSources().pipe()
    .subscribe((res) => {
      this.sources = res as Sources[];   
    });
    this.subscriptions.push(sb);   
  }    

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }  

}
