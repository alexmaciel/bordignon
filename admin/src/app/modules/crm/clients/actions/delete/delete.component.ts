import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of, Subscription } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { ClientsService } from '../../../services';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
})
export class DeleteClientComponent implements OnInit, OnDestroy {
  @Input() id: number | any;

  isLoading: boolean = false;
  subscriptions: Subscription[] = [];

  constructor(
    public modal: NgbActiveModal,
    // Services
    private clientsService: ClientsService, 
  ) { }

  ngOnInit(): void {
  }

  deleteClient() {
    this.isLoading = true;
    const sb = this.clientsService.delete(this.id).pipe(
      tap(() => this.modal.close()),
      catchError((err) => {
        this.modal.dismiss(err);
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
