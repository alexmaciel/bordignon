import { Component } from '@angular/core';
import { Subscription } from 'rxjs';

import { ServiceService } from '../../../core';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html'
})
export class ServicesComponent {
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
