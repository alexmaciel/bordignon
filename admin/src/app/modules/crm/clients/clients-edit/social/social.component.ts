import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  GroupingState,
  SortState,
  IDeleteAction,
  IGroupingView,
} from '../../../../../shared';

import { SocialService } from '../../../services';
import { Clients } from '../../../models';

import { EditSocialComponent } from './edit-social/edit-social.component';
import { DeleteSocialComponent } from './delete-social/delete-social.component';

@Component({
  selector: 'app-social',
  templateUrl: './social.component.html',
})
export class SocialComponent 
  implements 
  OnInit, 
  OnDestroy,
  IDeleteAction,
  IGroupingView {

  @Input() client!: Clients;

  isLoading: boolean = false;

  sorting!: SortState;
  grouping!: GroupingState;

  active: number;

  private subscriptions: Subscription[] = [];
    
  constructor(
    private modalService: NgbModal,
    // Services
    public socialService: SocialService
  ) { }

  ngOnInit(): void {
    this.socialService.fetch();
    const sb = this.socialService.isLoading$.subscribe(res => this.isLoading = res);
    this.subscriptions.push(sb);    
    this.socialService.patchState({ userid: this.client.userid });
    this.grouping = this.socialService.grouping
    this.sorting = this.socialService.sorting;
    this.sorting.column = 'order';    
    this.socialService.fetch();    
  }

  create() {
    this.edit(0);
  }

  edit(id: number): void {
    const modalRef = this.modalService.open(EditSocialComponent);
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.clientid = this.client.userid;
    modalRef.result.then(() =>
      this.socialService.fetch(),
      () => { }
    );
  }    

  delete(id: number) {
    const modalRef = this.modalService.open(DeleteSocialComponent);
    modalRef.componentInstance.id = id;
    modalRef.result.then(
      () => this.socialService.fetch(),
      () => { }
    );
  }  

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }     
}
