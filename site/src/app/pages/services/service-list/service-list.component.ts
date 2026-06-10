import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { 
  ServiceService,
} from '../../../core';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html'
})
export class ServiceListComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];

  constructor(
    // Services
    public services: ServiceService,  
  ) { } 

  ngOnInit(): void {
    const sb = this.services.getServices().pipe(
    ).subscribe();
    this.subscriptions.push(sb);    
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  } 
}
