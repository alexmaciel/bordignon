import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of, Subscription } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { ContactService } from '../../services';

@Component({
  selector: 'app-delete-contacts:not(contacts)',
  templateUrl: './delete-contacts.component.html',
})
export class DeleteContactsComponent implements OnInit, OnDestroy {
  @Input() id: number | any;

  isLoading: boolean = false;
  subscriptions: Subscription[] = [];

  constructor(
    public modal: NgbActiveModal,
    // Services
    private contactService: ContactService, 
  ) { }

  ngOnInit(): void {
  }

  deleteContact() {
    this.isLoading = true;
    const sb = this.contactService.delete(this.id).pipe(
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
