import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of, Subscription } from 'rxjs';
import { catchError, finalize} from 'rxjs/operators';

import { ProductsService } from '../../../core';


@Component({
  selector: 'app-delete-product',
  templateUrl: './delete-product.component.html'
})
export class DeleteProductComponent implements OnInit, OnDestroy {
  @Input() id: number | any;

  isLoading = false;
  subscriptions: Subscription[] = [];

  constructor(
    public modal: NgbActiveModal,
    // Services
    private productService: ProductsService, 
  ) { }

  ngOnInit(): void {
  }

  deleteProduct() {
    this.isLoading = true;
    const sb = this.productService.delete(this.id).pipe(
      catchError((err) => {
        this.modal.dismiss(err);
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
