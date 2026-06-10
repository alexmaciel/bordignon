import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { of, Subscription } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ClientsService } from '../../../services';

@Component({
  selector: 'app-delete-selected',
  templateUrl: './delete-selected.component.html',
})
export class DeleteClientSelectedComponent implements OnInit, OnDestroy {
  @Input() ids: number[] | any;

  isLoading: boolean = false;
  subscriptions: Subscription[] = [];

  constructor(
    public modal: NgbActiveModal,
    // Services
    private clientsService: ClientsService, 
  ) { }

  ngOnInit(): void {
  }

  deleteClients() {
    this.isLoading = true;
    const sb = this.clientsService.deleteItems(this.ids).pipe(
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
