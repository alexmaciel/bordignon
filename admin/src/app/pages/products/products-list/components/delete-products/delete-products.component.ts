import { Component, Input, OnDestroy } from '@angular/core';
import { of, Subscription } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ProductsService } from '../../../core';

@Component({
  selector: 'app-delete-products',
  templateUrl: './delete-products.component.html'
})
export class DeleteProductsComponent implements OnDestroy {
  @Input() ids: number[] | any;

  isLoading = false;
  subscriptions: Subscription[] = [];

  constructor(
    public modal: NgbActiveModal,
    // Services
    private productService: ProductsService, 
  ) { }

  deleteProducts() {
    this.isLoading = true;
    const sb = this.productService.deleteItems(this.ids).pipe(
      catchError((errorMessage) => {
        this.modal.dismiss(errorMessage);
        return of(undefined);
      }),
      finalize(() => {
        this.isLoading = false;
        this.modal.close();
      })
    ).subscribe();
    this.subscriptions.push(sb);
  }  

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
