import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { of, Subscription } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXDropzoneConfigInterface, NgxDropzoneDirective } from '../../../../shared/plugins/dropzone';

import { ContactService, ComposerService } from '../../services';
import { AuthService } from '../../../auth';

@Component({
  selector: 'app-composer',
  templateUrl: './composer.component.html',
})
export class ComposerComponent implements OnInit, OnDestroy {
  @ViewChild('drop', { static: false }) drop?: NgxDropzoneDirective;
  
  isLoading: boolean = false;
  
  formGroup!: FormGroup;
  contactGroup!: FormGroup;

  files: File[] = [];

  config: NGXDropzoneConfigInterface = {
    acceptedFiles: 'image/*',
    thumbnailMethod: 'crop'
  }

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    public modal: NgbActiveModal,
    // Services
    public contacts: ContactService,
    private composer: ComposerService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.loadForm();

    const sb = this.contacts.isLoading$.subscribe(res => this.isLoading = res);
    this.subscriptions.push(sb);    
    this.contacts.fetch();
  }

  loadForm() {
    let from_email = this.authService.currentUserValue?.email;
    let from_name = this.authService.currentUserValue?.firstname;
    let contact = new FormControl("", Validators.compose([
      Validators.required,
    ]));
    this.contactGroup = new FormGroup({
      contact: contact
    });

    this.formGroup = this.fb.group({
      contact_emails: contact,       
      from_email: [from_email, Validators.compose([
        Validators.required, 
      ])], 
      from_name: [from_name, Validators.compose([
        Validators.nullValidator, 
      ])],                   
      subject: ["", Validators.compose([
        Validators.required, 
        Validators.minLength(3)
      ])],
      message: ["", Validators.compose([
        Validators.required, 
        Validators.minLength(3)
      ])],   
      file: ["", Validators.compose([
        Validators.nullValidator, 
      ])],         
    })
  }

  onSubmit() {
    this.formGroup.markAllAsTouched();
    if (!this.formGroup.valid) {
      return;
    }

    const formData = new FormData();
    formData.append('contact_emails', this.formGroup.get('contact_emails')?.value);
    formData.append('from_email', this.formGroup.get('from_email')?.value);
    formData.append('from_name', this.formGroup.get('from_name')?.value);
    formData.append('subject', this.formGroup.get('subject')?.value);
    formData.append('message', this.formGroup.get('message')?.value);
    formData.append('file', this.formGroup.get('file')?.value);

    this.isLoading = true;
    const sbSend = this.composer.send_email(formData).pipe( 
      catchError((errorMessage) => {
        console.log(errorMessage);
        return of(formData);
      }),
      finalize(() => {
        this.isLoading = false;
        //this.modal.close();    
      }),
    ).subscribe(res => console.log(res));
    this.subscriptions.push(sbSend);     
  }

  onUploadInit(event: any): void {
    //console.log('onUploadInit:', event);
  }

  /**
   * on file drop handler
   */
  onFileDropped(event: any) {
    this.prepareFilesList(event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(event: any) {
    this.prepareFilesList(event);
  }


  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      this.files.push(item);
      this.formGroup.get('file')?.setValue(item);
    }
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
