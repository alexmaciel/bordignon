import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of, Subscription } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { LeadService } from '../../services';

@Component({
  selector: 'app-leads-delete',
  templateUrl: './leads-delete.component.html',
})
export class LeadsDeleteComponent implements OnInit, OnDestroy {
  @Input() id: number | any;

  isLoading: boolean = false;
  subscriptions: Subscription[] = [];

  constructor(
    public modal: NgbActiveModal,
    // Services
    private leadService: LeadService, 
  ) { }

  ngOnInit(): void {
  }

  deleteLead() {
    this.isLoading = true;
    const sb = this.leadService.delete(this.id).pipe(
      catchError((err) => {
        this.modal.dismiss(err);
        return of(undefined);
      }),
      finalize(() => {
        this.modal.close();
        this.isLoading = false;
      })
    ).subscribe();
    this.subscriptions.push(sb);
  }  

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  } 
}
