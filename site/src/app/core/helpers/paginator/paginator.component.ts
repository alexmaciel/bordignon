import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { PageSizes, PaginatorState } from '../models/paginator.model';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PaginatorComponent implements OnInit {
  @Input() paginator!: PaginatorState;
  @Input() isLoading?: boolean;
  @Output() paginate = new EventEmitter<PaginatorState>();
  pageSizes: number[] = PageSizes;

  disabled!: boolean;

  constructor() {}

  ngOnInit(): void {
  }

  hasNext(): boolean { return this.paginator.total > this.paginator.pageSize;}
  nextDisabled(): boolean { return !this.hasNext() || this.disabled; }

  pageChange(num: number) {
    this.paginator.page = num;
    this.paginate.emit(this.paginator);
  }

  selectPage(num: number) {
    this.paginator.pageSize = +this.paginator.pageSize +num;
    this.paginator.page = 1;
    this.paginate.emit(this.paginator);    
  }

  sizeChange() {
    this.paginator.pageSize = +this.paginator.pageSize;
    this.paginator.page = 1;
    this.paginate.emit(this.paginator);
  }
}
