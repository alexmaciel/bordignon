import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, first } from 'rxjs/operators';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService, ConfirmPasswordValidator } from '../../../auth';

import { ContactService } from '../../services';
import { Contacts } from '../../models';

const EMPTY_CONTACTS: Contacts = {
  id: undefined,
  userid: undefined,
  firstname: '',
  lastname: '',
  email: '',
  phonenumber: '',
  password: '',
  is_primary: 0,
  active: 1
};

@Component({
  selector: 'app-edit-contacts',
  templateUrl: './edit-contacts.component.html',
})
export class EditContactsComponent implements OnInit, OnDestroy {
  @Input() id!: number;
  @Input() userid!: number;

  isLoading$?: Observable<boolean>;

  showPassword?: boolean = false;
  errorMessage?: string = '';
  staffid?: number;

  contacts!: Contacts;
  formGroup!: FormGroup;

  send_set_password_email: boolean = false;
  set_primary_contact: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder, 
    public modal: NgbActiveModal,
    // Services
    private auth: AuthService,
    private contactService: ContactService,  
  ) { 
    this.staffid = this.auth.currentUserValue?.staffid;
  }

  ngOnInit(): void {
    this.isLoading$ = this.contactService.isLoading$;
    this.loadContact();
  } 

  loadContact() {
    if (!this.id) {
      this.contacts = EMPTY_CONTACTS;
      this.contacts.userid = this.userid;
      this.loadForm();
    } else {
      const sb = this.contactService.getItemById(this.id).pipe(
        first(),
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          const empty = EMPTY_CONTACTS;
          empty.userid = this.userid;
          return of(empty);
        })
      ).subscribe((contacts: Contacts) => {
        this.contacts = contacts;

        const is_primary = this.contacts.is_primary == 1 ? true : false;
        this.set_primary_contact = is_primary;

        this.loadForm();
      });
      this.subscriptions.push(sb);
    }
  }

  loadForm() {
    if (!this.contacts) {
      return;
    } 

    this.formGroup = this.fb.group({
      active: [this.contacts.active, Validators.compose([
        Validators.required
      ])],   
      firstname: [this.contacts.firstname, Validators.compose([
        Validators.required
      ])],
      lastname: [this.contacts.lastname, Validators.compose([
        Validators.required
      ])],
      email: [this.contacts.email, Validators.compose([
        Validators.required, 
        Validators.email
      ])], 
      phonenumber: [this.contacts.phonenumber, Validators.compose([
        Validators.required, 
      ])],   
      userid: [this.contacts.userid, Validators.compose([
        Validators.required, 
      ])],        
      is_primary: [this.set_primary_contact, Validators.compose([
        Validators.nullValidator, 
      ])],         
      send_set_password_email: [this.send_set_password_email, Validators.compose([
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
    this.contacts = Object.assign(this.contacts, formData);

    if (this.id) {
      this.edit();
    } else {
      this.create();
    }
  }  
  
  create() {
    const sbCreate = this.contactService.create(this.contacts).pipe(
      catchError((errorMessage) => {
        this.modal.dismiss(errorMessage);
        return of(this.contacts);
      }),
      finalize(() => this.modal.close())
    ).subscribe(res => console.log(res));
    this.subscriptions.push(sbCreate);
  }

  edit() {
    const sbUpdate = this.contactService.update(this.contacts).pipe(
      catchError((errorMessage) => {
        this.modal.dismiss(errorMessage);
        return of(this.contacts);
      }),
      finalize(() => this.modal.close())
    ).subscribe();
    this.subscriptions.push(sbUpdate);
  }  
  
  showHidePassword() {
    this.showPassword = !this.showPassword;
  }   
  
  sendEmail(ev: any){
    this.send_set_password_email = ev.target.checked;
  }   
  
  setPrimary(ev: any){
    const checked = ev.target.checked;
    checked == true ? 0 : 1;
    this.set_primary_contact = checked;
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
