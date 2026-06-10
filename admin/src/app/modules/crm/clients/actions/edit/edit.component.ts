import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../../auth';

import { ClientsService } from '../../../services';
import { Clients } from '../../../models';

const EMPTY_CLIENT: Clients = {
  id: 0,
  userid: 0,
  company: '',
  website: '',
  date: '',
  phonenumber: '',
  active: 1,
  address: '',
  city: '',
  zip: '',
  state: ''
};

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
})
export class EditClientsComponent implements OnInit, OnDestroy {

  isLoading$?: Observable<boolean>;

  errorMessage: string = '';
  staffid?: number;

  client: Clients | any;
  formGroup!: FormGroup;
  
  save_and_add_contact: boolean = true;

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder, 
    public modal: NgbActiveModal,
    // Services
    private clientsService: ClientsService,  
    private auth: AuthService    
  ) { 
    this.staffid = this.auth.currentUserValue?.staffid;
  }

  ngOnInit(): void {
    this.isLoading$ = this.clientsService.isLoading$;
    this.loadContact();
  } 

  loadContact() {
    this.client = EMPTY_CLIENT;
    this.loadForm();
  }

  loadForm() {
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
    const formData = this.formGroup.value;
    this.client = Object.assign(this.client, formData);

    this.create();
  }  
  
  create() {
    const sbCreate = this.clientsService.create(this.client).pipe(
      catchError((errorMessage) => {
        this.modal.dismiss(errorMessage);
        return of(this.client);
      }),
      finalize(() => this.modal.close())
    ).subscribe();
    this.subscriptions.push(sbCreate);
  }


  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }

  createContact(ev: any){
    this.save_and_add_contact = ev.target.checked;
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
