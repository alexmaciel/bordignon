import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  host: {'app-contact-page': 'contact-page', ngSkipHydration: 'true'},
})
export class ContactComponent {

  constructor(
    private router: Router,
  ) {}

  changeRoute(event: Event) {
    event.preventDefault();
    this.router.navigate(['/contato']);    
  }
}
