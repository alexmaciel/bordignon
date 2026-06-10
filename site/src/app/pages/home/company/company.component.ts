import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { CompanyService } from '../../../core';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html'
})
export class CompanyComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  
  constructor(
    // Services
    public company: CompanyService,
  ) { }

  ngOnInit(): void {
    const sb = this.company.getCompany().pipe(
    ).subscribe();
    this.subscriptions.push(sb);   
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }   
}
