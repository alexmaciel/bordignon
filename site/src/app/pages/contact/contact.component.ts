import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, Observable, of, Subscription } from 'rxjs';

import {
  // Validators
  CountryPhone,
  PhoneValidator,
} from '../../core/helpers/validators';

import { 
  SettingService,
  SendmailService,
  SocialService,
} from '../../core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
})
export class ContactComponent implements OnInit, OnDestroy {
  isLoading$?: Observable<boolean>;

  selectedTerms: boolean = true;

  alert: boolean = false;
  message: string = '';

  formGroup!: FormGroup;
  countryPhoneGroup!: FormGroup;

  countriesPhone!: Array<CountryPhone>;
  selectedCountry!: any;

  private unsubscribe: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    // Services
    public settings: SettingService,  
    public socials: SocialService,
    public send: SendmailService,
  ) { }
    
  ngOnInit(): void {
    this.loadSocial();
    //  We just use a few random countries, however, you can use the countries you need by just adding them to this list.
    // also you can use a library to get all the countries from the world.
    this.countriesPhone = [
      new CountryPhone('BR', 'Brasil'),
    ];  
    this.selectedCountry = this.countriesPhone[0];    
    this.loadForm();
  }

  loadSocial() {
    const sb = this.socials.getSocial().subscribe();
    this.unsubscribe.push(sb) 
  }

  loadForm() {
    let country = new FormControl(this.selectedCountry, Validators.required);
    let phonenumber = new FormControl('', Validators.compose([
      Validators.required,
      PhoneValidator.validCountryPhone(country)
    ]));
    this.countryPhoneGroup = new FormGroup({
      country: country,
      phonenumber: phonenumber
    });  
        
    this.formGroup = this.fb.group({
      subject: ["", Validators.compose([
        Validators.required
      ])],
      firstname: ["", Validators.compose([
          Validators.required, 
          Validators.minLength(3), 
          Validators.maxLength(20)
      ])],
      lastname: ["", Validators.compose([
          Validators.required, 
          Validators.minLength(3), 
          Validators.maxLength(20)
      ])], 
      email: ["", Validators.compose([
        Validators.required, 
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])],
      country_phone: this.countryPhoneGroup,
      message: ["", Validators.compose([
        Validators.required,
        Validators.minLength(3), 
      ])],      
      terms: [this.selectedTerms, Validators.pattern('true')],           
    })
  }  

  onSubmit(): void {
    this.formGroup.markAllAsTouched();
    if (!this.formGroup.valid) {
      return;
    }    

    const formData = new FormData();
    formData.append('subject', this.formGroup.get('subject')?.value);
    formData.append('firstname', this.formGroup.get('firstname')?.value);
    formData.append('lastname', this.formGroup.get('lastname')?.value);
    formData.append('email', this.formGroup.get('email')?.value);
    formData.append('phone', this.formGroup.get('country_phone')?.get('phonenumber')?.value);
    formData.append('message', this.formGroup.get('message')?.value);


    const sb = this.send.sendEmail(formData).pipe(
      catchError((errorMessage) => {
        console.error('UPDATE ERROR', errorMessage);
        return of(undefined);
      })
    ).subscribe((res) => {
      this.alert = true;
      if(res.type == 'success') {
        this.message = res.message;
      } else {
        this.message = res.message;
      }
    });
    this.unsubscribe.push(sb);   
  }
    
  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
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
