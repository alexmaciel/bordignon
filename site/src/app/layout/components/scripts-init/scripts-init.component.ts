import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  ScrollTopComponent,
  MenuComponent,
  ScrollComponent,
} from '../../scripts/components';

@Component({
  selector: 'app-scripts-init',
  templateUrl: './scripts-init.component.html',
})
export class ScriptsInitComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = [];

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.pluginsInitialization();
  }

  pluginsInitialization() {
    setTimeout(() => {
      ScrollTopComponent.bootstrap();
      MenuComponent.bootstrap();
      ScrollComponent.bootstrap();
    }, 200);
  }

  pluginsReInitialization() {
    setTimeout(() => {
      ScrollTopComponent.reinitialization();
      MenuComponent.reinitialization();
      ScrollComponent.reinitialization();
    }, 100);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
