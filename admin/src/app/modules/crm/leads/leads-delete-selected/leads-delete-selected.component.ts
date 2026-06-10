import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { of, Subscription } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { LeadService } from '../../services';

@Component({
  selector: 'app-leads-delete-selected',
  templateUrl: './leads-delete-selected.component.html',
})
export class LeadsDeleteSelectedComponent implements OnInit, OnDestroy {
  @Input() ids: number[] | any;

  isLoading: boolean = false;
  subscriptions: Subscription[] = [];

  constructor(
    public modal: NgbActiveModal,
    // Services
    private leadService: LeadService, 
  ) { }

  ngOnInit(): void {
  }

  deleteLeads() {
    this.isLoading = true;
    const sb = this.leadService.deleteItems(this.ids).pipe(
      tap(() => this.modal.close()),
      catchError((errorMessage) => {
        this.modal.dismiss(errorMessage);
        return of(undefined);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe();
    this.subscriptions.push(sb);
  }  

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }

}
