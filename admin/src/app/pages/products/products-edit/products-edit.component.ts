import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { catchError, finalize, switchMap, take, tap } from 'rxjs/operators';

import { LocalizeRouterService } from '@gilsdav/ngx-translate-router';
import { AuthService } from '../../../modules/auth';

import { 
  CategoriesService,
  ProductsService, 
  Products, 
  Category,
  Activity
} from '../core';


import { PaginatorState } from '../../../shared';


const EMPTY_PRODUCT: Products = {
  id: undefined,
  name: '',
  description: '',
  long_description: '',
  active: 1,
  date: '',
  folder: ''
};

@Component({
  selector: 'app-products-edit',
  templateUrl: './products-edit.component.html'
})
export class ProductsEditComponent implements OnInit, OnDestroy {
  id?: number;
  staffid?: number;

  paginator!: PaginatorState;
  
  isLoading?: boolean = false;
  errorMessage = '';

  product!: Products;
  previous!: Products;

  categories: Category[] = [];
  selectedCategory: Category[] = [];

  activities: Activity[] = [];

  formGroup!: FormGroup;

  private subscriptions: Subscription[] = [];

  tabs = {
    BASIC_TAB: 0,
    //REMARKS_TAB: 1,
    //SPECIFICATIONS_TAB: 2
  };
  //activeTabId = this.tabs.BASIC_TAB;  
  activeTabId = 1;  
  
  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private localize: LocalizeRouterService,
    private route: ActivatedRoute,    
    private router: Router,
    // Services
    private authService: AuthService,
    private productsService: ProductsService,
    public categoriesService: CategoriesService,
  ) { 
    this.staffid = this.authService.currentUserValue?.staffid;
  }  

  ngOnInit(): void {
    this.loadProducts();   
    this.loadCategories(); 
    this.loadActivity();
  }

  loadProducts() {
    this.isLoading = true;

    const sb = this.route.paramMap.pipe(
      take(1),
      switchMap(params => {
        // get id from URL
        this.id = Number(params.get('id'));
        return this.id && this.id > 0
          ? this.productsService.getItemById(this.id)
          : of(EMPTY_PRODUCT);
      }),
      catchError((err) => {
        this.errorMessage = err;
        return of(undefined);
      }),      
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();        
      })      
    ).subscribe((res) => {
      if (!res) {
        this.router.navigate(
          [this.localize.translateRoute(['/products']), { relativeTo: this.route }]
        );  
        
        return;
      }

      this.product = res as Products;
      this.previous = { ...this.product };

      const categories = Array.isArray(this.product?.categories) ? this.product.categories : [];

      this.selectedCategory = categories
        .map((c: any) => (typeof c?.category_id === 'number' ? c.category_id : Number(c?.category_id)))
        .filter((v: any) => Number.isFinite(v)
      );

      this.loadForm();
    });
    this.subscriptions.push(sb);
  }    

  loadForm() {
    if (!this.product) {
      return;
    } 

    const categories = Array.isArray(this.selectedCategory) ? this.selectedCategory : [];

    this.formGroup = this.fb.group({
      name: [this.product.name, Validators.compose([
        Validators.required, 
        Validators.minLength(3)
      ])],
      description: [this.product.description, Validators.compose([
        Validators.nullValidator,
        Validators.minLength(3),
        Validators.maxLength(250),
      ])],       
      long_description: [this.product.long_description, Validators.compose([
        Validators.required,
        Validators.minLength(10),
      ],)],  
      categories: [categories, Validators.compose([
        Validators.required,
      ])],                                  
      slug: [this.product.slug],
      languageid: [this.product.language?.languageid],          
      active: [this.product.active],                 
      staffid: [this.staffid],                 
    });    
  }  

  loadCategories() {
    this.categoriesService.fetch();
    const sb = this.categoriesService.isLoading$.subscribe(res => this.isLoading = res);
    this.subscriptions.push(sb);   
    this.categoriesService.sorting.column = 'name';      
  }

  loadActivity() {
    const sb = this.productsService.getActivity(this.id, 10).pipe()
    .subscribe((res) => {
      this.activities = res as Activity[];  
      this.cdr.detectChanges();     
    });
    this.subscriptions.push(sb);   
  }    

  // actions
  save() {
    this.formGroup.markAllAsTouched();
    if (!this.formGroup.valid) {
      return;
    }

    this.product = { ...this.product, ...this.formGroup.value };

    if (this.product.id) {
      this.edit();
    } else {
      this.create();
    }   
  }

  edit() {
    this.isLoading = true;

    const sbUpdate = this.productsService.update(this.product).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }),       
      catchError((err) => {
        console.error('UPDATE ERROR', err);
        return of(this.product);
      })
    ).subscribe();
    this.subscriptions.push(sbUpdate);
  }  

  create() {
    this.isLoading = true;

    const sbCreate = this.productsService.create(this.product).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }),      
      catchError((err) => {
        console.error('CREATE ERROR', err);
        return of(this.product);
      })
    ).subscribe((res) => {
      const id = res.data?.id;
       if (id) {
        this.router.navigate([this.localize.translateRoute(`/products/edit/${id}`)]);        
       }
    });
    this.subscriptions.push(sbCreate);
  }

  editExit() {
    this.product = { ...this.product, ...this.formGroup.value };

    const sbUpdate = this.productsService.update(this.product).pipe(
      tap(() => this.router.navigate([this.localize.translateRoute(`/products/`)])),
      catchError((errorMessage) => {
        console.error('UPDATE ERROR', errorMessage);
        return of(this.product);
      })
    ).subscribe();
    this.subscriptions.push(sbUpdate);    
  } 

  reset() {
    if (!this.previous) {
      return;
    }

    this.product = Object.assign({}, this.previous);
    this.loadForm();
  }  


  compareById = (a: any, b: any) => {
    if (a == null || b == null) return a === b;
    // quando usa bindValue="id", 'a' pode ser o valor primitivo do form (ex.: 3) e 'b' pode ser o item.id
    return +a === +b || (a?.id != null && +a.id === +b);
  };

  setActiveTab(tabId: number) {
    this.activeTabId = tabId;
  }

  getActiveTabCSSClass(tabId: number) {
    if (tabId !== this.activeTabId) {
      return '';
    }
    return 'active';
  } 

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }  

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation: string, controlName: string) {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.dirty || control.touched;
  }   
}
