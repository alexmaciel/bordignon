import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, finalize, first, of, Subscription } from 'rxjs';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AuthService, ConfirmPasswordValidator } from '../../../../auth';

import { LeadService } from '../../../services';
import { Leads } from '../../../models';

@Component({
  selector: 'app-convert-lead-to-customer',
  templateUrl: './convert-lead-to-customer.component.html',
})
export class ConvertLeadToCustomerComponent implements OnInit, OnDestroy {
  @Input() id!: number;

  isLoading: boolean = false;
  showPassword: boolean = false;

  send_set_password_email: boolean = false;
  set_primary_contact: boolean = false;
  do_notsend_welcome_email: boolean = false;

  leads?: Leads | any;
  staffid?: number;

  formGroup!: FormGroup;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder, 
    public modal: NgbActiveModal,
    // Services
    private auth: AuthService,   
    public leadService: LeadService,  
  ) { 
    this.staffid = this.auth.currentUserValue?.staffid;
  }

  ngOnInit(): void {
    this.loadLead();
  } 

  loadLead() {
    const sb = this.leadService.getItemById(this.id).pipe(
      first(),
      catchError((errorMessage) => {
        this.modal.dismiss(errorMessage);
        return of(undefined);
      })
    ).subscribe((res) => {
      this.leads = res;
      this.loadForm();
    });
    this.subscriptions.push(sb);
  }

  loadForm() {
    if (!this.leads) {
      return;
    } 

    this.formGroup = this.fb.group({ 
      firstname: [this.leads.firstname, Validators.compose([
        Validators.required
      ])],
      lastname: [this.leads.lastname, Validators.compose([
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
      send_set_password_email: [this.send_set_password_email, Validators.compose([
        Validators.nullValidator
      ])],  
      save_and_add_contact: [true, Validators.compose([
        Validators.nullValidator
      ])],
      do_notsend_welcome_email: [false, Validators.compose([
        Validators.nullValidator
      ])],      
      password: ['', Validators.nullValidator],
      cPassword: ['', Validators.nullValidator]                               
    }, {
      validator: ConfirmPasswordValidator.MatchPassword
    });
  }  

  save() {
    const formData = this.formGroup.value;
    this.leads = Object.assign(this.leads, formData);

    this.convert_to_customer();
  }  

  convert_to_customer() {
    this.isLoading = true;
    const sbUpdate = this.leadService.convert_to_customer(this.leads).pipe(
      catchError((errorMessage) => {
        this.modal.dismiss(errorMessage);
        return of(this.leads);
      }),
      finalize(() => {
        this.isLoading = false;
        this.modal.close();
      })
    ).subscribe();
    this.subscriptions.push(sbUpdate);
  } 

  showHidePassword() {
    this.showPassword = !this.showPassword;
  }   
  
  sendEmail(ev: any){
    this.send_set_password_email = ev.target.checked;
  }   

  doNotSendemail(ev: any){
    this.do_notsend_welcome_email = ev.target.checked;
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
