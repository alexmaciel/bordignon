import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  PaginatorState,
  GroupingState,
  SortState,
  IDeleteAction,
  IGroupingView,
} from '../../../../shared';

import { ContactService } from '../../services';

import { EditContactsComponent } from '../edit-contacts/edit-contacts.component';
import { DeleteContactsComponent } from '../delete-contacts/delete-contacts.component';

@Component({
  selector: 'app-contacts-list',
  templateUrl: './contacts-list.component.html',
})
export class ContactsListComponent
  implements 
  OnInit, 
  OnDestroy,
  IDeleteAction,
  IGroupingView {

  isLoading: boolean = false;

  paginator!: PaginatorState;
  grouping!: GroupingState;
  sorting!: SortState;

  is_primary: number;

  private subscriptions: Subscription[] = [];

  constructor(
    private modalService: NgbModal,
    // Services
    public contacts: ContactService,        
  ) { }

  ngOnInit(): void {
    this.contacts.fetch();
    const sb = this.contacts.isLoading$.subscribe(res => this.isLoading = res);
    this.subscriptions.push(sb);    
    this.paginator = this.contacts.paginator;
    this.grouping = this.contacts.grouping
    this.sorting = this.contacts.sorting;
    this.sorting.column = 'company';    
    this.contacts.fetch();
  }

  // actions
  edit(id: number): void {
    const modalRef = this.modalService.open(EditContactsComponent);
    modalRef.componentInstance.id = id;
    modalRef.result.then(
      () => this.contacts.fetch(),
      () => {}
    );
  }

  delete(id: number) {
    const modalRef = this.modalService.open(DeleteContactsComponent);
    modalRef.componentInstance.id = id;
    modalRef.result.then(
      () => this.contacts.fetch(),
      () => { }
    );
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
    this.contacts.patchState({ sorting });
  }   
  
  // pagination
  paginate(paginator: PaginatorState) {
    this.contacts.patchState({ paginator });
  }    

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }    
}
