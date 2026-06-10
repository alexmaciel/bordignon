import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, first } from 'rxjs/operators';

import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../auth';

import { LeadService } from '../../services';
import { Leads, Sources } from '../../models';

const EMPTY_LEADS: Leads = {
  id: 0,
  name: '',
  company: '',
  website: '',
  email: '',
  phonenumber: '',
  city: '',
  zip: '',
  state: ''
};

import { ConvertLeadToCustomerComponent } from '../components/convert-lead-to-customer/convert-lead-to-customer.component';


@Component({
  selector: 'app-leads-edit',
  templateUrl: './leads-edit.component.html',
})
export class LeadsEditComponent implements OnInit, OnDestroy {
  @Input() id!: number;

  isLoading$?: Observable<boolean>;

  showPassword: boolean = false;
  errorMessage: string = '';

  staffid?: number;

  leads!: Leads;
  sources: Sources[] = [];
  formGroup!: FormGroup;

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder, 
    public modal: NgbActiveModal,
    private modalService: NgbModal,
    // Services
    private auth: AuthService,   
    private leadService: LeadService,  
  ) { 
    this.staffid = this.auth.currentUserValue?.staffid;
  }

  ngOnInit(): void {
    this.isLoading$ = this.leadService.isLoading$;
    this.loadLead();
    this.loadSource();
  } 

  loadLead() {
    if (!this.id) {
      this.leads = EMPTY_LEADS;
      this.loadForm();
    } else {
      const sb = this.leadService.getItemById(this.id).pipe(
        first(),
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          const empty = EMPTY_LEADS;
          return of(empty);
        })
      ).subscribe((res: Leads) => {
        this.leads = res;

        this.loadForm();
      });
      this.subscriptions.push(sb);
    }
  }

  loadForm() {
    if (!this.leads) {
      return;
    } 

    this.formGroup = this.fb.group({ 
      name: [this.leads.name, Validators.compose([
        Validators.required
      ])],
      email: [this.leads.email, Validators.compose([
        Validators.required, 
        Validators.email
      ])], 
      company: [this.leads.company, Validators.compose([
        Validators.nullValidator, 
      ])],         
      phonenumber: [this.leads.phonenumber, Validators.compose([
        Validators.required, 
      ])],   
      description: [this.leads.description, Validators.compose([
        Validators.nullValidator,
        Validators.minLength(3),
        Validators.maxLength(250),        
      ])],    
      city: [this.leads.city, Validators.compose([
        Validators.nullValidator
      ])],     
      state: [this.leads.state, Validators.compose([
        Validators.nullValidator
      ])],               
      address: [this.leads.address, Validators.compose([
        Validators.nullValidator
      ])],  
      zip: [this.leads.zip, Validators.compose([
        Validators.nullValidator
      ])],         
      status: [this.leads.status, Validators.compose([
        Validators.nullValidator
      ])],  
      source: [this.leads.source, Validators.compose([
        Validators.nullValidator
      ])],              
      staffid: [this.staffid, Validators.compose([
        Validators.required
      ])],                       
    })
  }

  save() {
    const formData = this.formGroup.value;
    this.leads = Object.assign(this.leads, formData);

    if (this.id) {
      this.edit();
    } else {
      this.create();
    }
  }  
  
  create() {
    const sbCreate = this.leadService.create(this.leads).pipe(
      catchError((errorMessage) => {
        this.modal.dismiss(errorMessage);
        return of(this.leads);
      }),
      finalize(() => this.modal.close())
    ).subscribe(res => console.log(res));
    this.subscriptions.push(sbCreate);
  }

  edit() {
    const sbUpdate = this.leadService.update(this.leads).pipe(
      catchError((errorMessage) => {
        this.modal.dismiss(errorMessage);
        return of(this.leads);
      }),
      finalize(() => this.modal.close())
    ).subscribe();
    this.subscriptions.push(sbUpdate);
  }  

  convert_lead_to_customer(id: number) {
    const modalRef = this.modalService.open(ConvertLeadToCustomerComponent, { size: 'lg' });
    modalRef.componentInstance.id = id;
    modalRef.result.then(
      () => this.leadService.fetch(), 
      () => { }
    );
  }  
  

  loadSource() {
    const sb = this.leadService.getSources().pipe()
    .subscribe((res) => {
      this.sources = res as Sources[];   
    });
    this.subscriptions.push(sb);   
  }  

  ngOnDestroy(): void {
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

  controlHasError(validation: string, controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.dirty || control.touched;
  }  
}
