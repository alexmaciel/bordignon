import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent {

  constructor() { 
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-mv-app-header-color', 'color');
    }      
  }
}
