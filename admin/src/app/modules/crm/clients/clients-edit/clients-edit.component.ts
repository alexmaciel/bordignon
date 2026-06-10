import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { LocalizeRouterService } from '@gilsdav/ngx-translate-router';
import { AuthService } from '../../../auth';

import { ClientsService } from '../../services';
import { Clients } from '../../models';

const EMPTY_CLIENT: Clients = {
  id: 0,
  userid: 0,
  company: '',
  website: '',
  folder: '',
  date: '',
  phonenumber: '',
  active: 1,
  city: '',
  zip: '',
  state: ''
};

@Component({
  selector: 'app-clients-edit',
  templateUrl: './clients-edit.component.html',
})
export class ClientsEditComponent implements OnInit, OnDestroy {
  id!: number;
  
  isLoading$?: Observable<boolean>;

  errorMessage?: string = '';
  staffid?: number;

  client: Clients;
  previous: Clients;

  formGroup!: FormGroup;
  
  save_and_add_contact: boolean = true;

  tabs = {
    BASIC_TAB: 0,
    //REMARKS_TAB: 1,
    //SPECIFICATIONS_TAB: 2
  };
  //activeTabId = this.tabs.BASIC_TAB;  
  activeTabId = 1;  

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder, 
    private cdr: ChangeDetectorRef,
    private localize: LocalizeRouterService,
    private route: ActivatedRoute,    
    private router: Router,    
    // Services
    private clientsService: ClientsService,  
    private auth: AuthService,
  ) { 
    this.staffid = this.auth.currentUserValue?.staffid;
  }

  ngOnInit(): void {
    this.isLoading$ = this.clientsService.isLoading$;
    this.loadContact();
  }

  loadContact() {
    const sb = this.route.paramMap.pipe(
      switchMap(params => {
        // get id from URL
        this.id = Number(params.get('id'));
        if (this.id || this.id > 0) {
          return this.clientsService.getItemById(this.id);
        }
        return of(EMPTY_CLIENT);
      }),
    ).subscribe((res: Clients) => {
      if (!res) {
        this.router.navigate(
          [this.localize.translateRoute(['/clients']), { relativeTo: this.route }]
        );  
        
        return;
      }

      this.client = res as Clients;
      this.previous = Object.assign({}, this.client); 

      this.loadForm();
      this.cdr.detectChanges();
    });
    this.subscriptions.push(sb);
  }   

  loadForm() {
    if (!this.client) {
      return;
    } 

    this.formGroup = this.fb.group({
      active: [this.client.active, Validators.compose([
        Validators.required
      ])],   
      company: [this.client.company, Validators.compose([
        Validators.required
      ])],
      phonenumber: [this.client.phonenumber, Validators.compose([
        Validators.required
      ])],
      website: [this.client.website, Validators.compose([
        Validators.nullValidator
      ])],  
      description: [this.client.description, Validators.compose([
        Validators.nullValidator,
        Validators.minLength(3),
        Validators.maxLength(250),        
      ])],        
      address: [this.client.address, Validators.compose([
        Validators.nullValidator
      ])], 
      city: [this.client.city, Validators.compose([
        Validators.nullValidator
      ])], 
      zip: [this.client.zip, Validators.compose([
        Validators.nullValidator
      ])], 
      state: [this.client.state, Validators.compose([
        Validators.nullValidator
      ])],                   
      staffid: [this.staffid, Validators.compose([
        Validators.required
      ])],       
      save_and_add_contact: [this.save_and_add_contact, Validators.compose([
        Validators.nullValidator
      ])]      
    })
  }    

  save() {
    this.formGroup.markAllAsTouched();
    if (!this.formGroup.valid) {
      return;
    }

    const formValues = this.formGroup.value;
    this.client = Object.assign(this.client, formValues);

    if (this.client.userid) {
      this.edit();
    } else {
      this.create();
    } 
  }  

  create() {
    const sbCreate = this.clientsService.create(this.client).pipe(
      catchError((errorMessage) => {
        console.error('CREATE ERROR', errorMessage)
        return of(this.client);
      }),
    ).subscribe((res) => {
      const id = res.data?.id;
       if (id) {
        this.router.navigate([this.localize.translateRoute(`/crm/clients/edit/${id}`)]);        
       }       
    });
    this.subscriptions.push(sbCreate);
  }

  edit() {
    const sbUpdate = this.clientsService.update(this.client).pipe(
      catchError((errorMessage) => {
        console.error('UPDATE ERROR', errorMessage)
        return of(this.client);
      }),
    ).subscribe();
    this.subscriptions.push(sbUpdate);
  }  

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }

  createContact(ev: any){
    this.save_and_add_contact = ev.target.checked;
    this.formGroup.get('save_and_add_contact')?.setValue(this.save_and_add_contact);
  }    

  setActiveTab(tabId: number) {
    this.activeTabId = tabId;
  }

  getActiveTabCSSClass(tabId: number) {
    if (tabId !== this.activeTabId) {
      return '';
    }
    return 'active';
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

  controlHasError(validation: string, controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.dirty || control.touched;
  }   
}
