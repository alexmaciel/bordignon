import { Component, OnInit, OnDestroy } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Subscription, of } from 'rxjs';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import {
  SortState,
  IDeleteAction,
  PaginatorState,
  GroupingState,
  IGroupingView
} from '../../../shared';

import { EditItemComponent } from '../components/edit-items/edit-item.component';
import { DeleteItemComponent } from '../components/delete-items/delete-item.component';

import { ServicesService } from '../services';

@Component({
  selector: 'app-services-list',
  templateUrl: './services-list.component.html'
})
export class ServicesListComponent 
  implements 
  OnInit, 
  OnDestroy,
  IDeleteAction,
  IGroupingView {

  isLoading?: boolean = false;

  paginator!: PaginatorState;
  grouping!: GroupingState;
  sorting!: SortState;

  private subscriptions: Subscription[] = [];

  constructor(
    private modalService: NgbModal,
    // Services
    public servicesService: ServicesService,
  ) { }

  ngOnInit(): void {
    const sb = this.servicesService.isLoading$.subscribe(res => this.isLoading = res);
    this.subscriptions.push(sb);  
    this.grouping = this.servicesService.grouping;
    this.paginator = this.servicesService.paginator;
    this.sorting = this.servicesService.sorting;    
    this.servicesService.sorting.column = 'order';
    this.servicesService.fetch();
  }

  // form actions
  create() {
    this.edit(0);
  }

  edit(id: number) {
    const modalRef = this.modalService.open(EditItemComponent, { size: 'lg' });
    modalRef.componentInstance.id = id;
    modalRef.result.then(
      () => this.servicesService.fetch(), 
      () => { }
    );
  }

  delete(id: number) {
    const modalRef = this.modalService.open(DeleteItemComponent);
    modalRef.componentInstance.id = id;
    modalRef.result.then(
      () => this.servicesService.fetch(), 
      () => { }
    );
  }

  // sorting
  sort(column: string) {
    const sorting = this.sorting;
    const isActiveColumn = sorting.column === column;
    if (!isActiveColumn) {
      sorting.column = column;
      sorting.direction = 'desc';
    } else {
      sorting.direction = sorting.direction === 'asc' ? 'desc' : 'asc';
    }
    this.servicesService.patchState({ sorting });
  }   

  // pagination
  paginate(paginator: PaginatorState) {
    this.servicesService.patchState({ paginator });
  }  

  drop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.sortable(event.container.data);
    }
  }

  sortable(data: any[]) {
    const sb = this.servicesService.sortable(data).pipe(
      catchError((errorMessage) => {
        console.log(errorMessage);
        return of(undefined);
      }),
    ).subscribe();
    this.subscriptions.push(sb);
  }  

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  } 
}
