import { Component, Input, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subscription, finalize } from 'rxjs';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  GroupingState,
  SortState,
  IDeleteAction,
  IGroupingView,
} from '../../../../../shared';

import { ContactService } from '../../../services';
import { Contacts } from '../../../models';

import { EditContactsComponent } from './edit-contacts/edit-contacts.component';
import { DeleteContactsComponent } from './delete-contacts/delete-contacts.component';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
})
export class ContactsComponent 
  implements 
  OnInit, 
  OnDestroy,
  IDeleteAction,
  IGroupingView {

  @Input() userid!: number;

  isLoading: boolean = false;

  sorting!: SortState;
  grouping!: GroupingState;

  contacts: Contacts[] = [];

  is_primary: number;

  private subscriptions: Subscription[] = [];

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    // Services
    public contactService: ContactService,        
  ) { }

  ngOnInit(): void {
    this.loadContact();
  }

  loadContact() {
    const sb = this.contactService.getContactByClientId(this.userid).pipe(
      ).subscribe(res => {
        this.contacts = res;
        this.cdr.detectChanges();
      });
      this.subscriptions.push(sb);        
  }

  // actions
  edit(id: number): void {
    const modalRef = this.modalService.open(EditContactsComponent);
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.userid = this.userid;
    modalRef.result.then(() =>
      this.loadContact(),
      () => {}
    );
  }

  create(): void {
    this.edit(0);
  }

  delete(id: number) {
    const modalRef = this.modalService.open(DeleteContactsComponent);
    modalRef.componentInstance.id = id;
    modalRef.result.then(
      () => this.loadContact(),
      () => { }
    );
  }  

  changeStatus(ev: any){
    const ids = ev.target.value;
    const checked = ev.target.checked;
    this.is_primary = checked == true ? 1 : 0;
    
    const sb = this.contactService.updateStatusForItems([ids], +this.is_primary).pipe(
      finalize(() => this.loadContact())
    ).subscribe();
    this.subscriptions.push(sb);      
  }    

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }   

}
