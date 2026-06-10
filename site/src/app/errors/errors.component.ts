import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-errors',
  templateUrl: './errors.component.html',
})
export class ErrorsComponent implements OnInit {
  @HostBinding('class') class = 'd-flex flex-column flex-root';
  
  constructor(private router: Router) {}

  ngOnInit(): void {}

  routeToPage(page: string) {
    this.router.navigate([page]);
  }
}
