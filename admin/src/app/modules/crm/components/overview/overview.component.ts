import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// components
//import { EditContactComponent } from '../contacts/actions/edit/edit.component';

import { OverviewService } from '../../services';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
})
export class OverviewComponent implements OnInit {

  active: number = 1;

  isLoading?: boolean = false;

  private subscriptions: Subscription[] = [];
  
  constructor(
    private modalService: NgbModal,
    // Services
    public overview: OverviewService,
  ) { }

  ngOnInit(): void {
    const sb = this.overview.getOverview().pipe()
    .subscribe();
    this.subscriptions.push(sb);    
  }

  // actions
  // form actions
  create() {
    this.edit(0);
  }

  edit(id: number) {
    const modalRef = this.modalService.open('', { size: 'lg' });
    modalRef.componentInstance.id = id;
    modalRef.result.then(
      () => { },
      () => { }
    );
  }  

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }   
}
