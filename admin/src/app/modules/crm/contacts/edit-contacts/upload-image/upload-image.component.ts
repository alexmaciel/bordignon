import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, map } from 'rxjs/operators';
import { Observable, of, Subscription } from 'rxjs';

import { SettingsService, Settings } from '../../../../../core';

import { ContactService } from '../../../services';
import { Contacts } from '../../../models';

@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
})
export class UploadImageComponent implements OnInit, OnDestroy {
  @Input() contact!: Contacts;

  //contact!: Contacts;

  settings$!: Observable<Settings>;
  isLoading$: Observable<boolean>;

  hasError: boolean = false;

  file: File;

  profile_image = '';
  fileName: string = "No file selected";

  formGroup: FormGroup;

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder, 
    private cdr: ChangeDetectorRef,  
    // Services
    private settings: SettingsService,   
    private contactService: ContactService,  
  ) { }

  ngOnInit(): void {
    this.isLoading$ = this.contactService.isLoading$;
    this.settings$ = this.settings.settings$;
    this.loadForm();
  }

  loadContact() {
    const sb = this.contactService.getItemById(this.contact.id).pipe()
    .subscribe((res) => {
      this.contact = res as Contacts;
      this.loadForm();
      this.cdr.detectChanges();
    });
    this.subscriptions.push(sb);
  }

  loadForm() {
    if (!this.contact) {
      return;
    } 

    this.formGroup = this.fb.group({
      profile_image: [this.contact.profile_image],
      id: [this.contact.id],
    });
  }        

  onSelectedFile(event: any) {
    if(event.target.files.length) {
      const file = event.target.files[0];
      this.formGroup.get('profile_image')?.setValue(file);
      this.uploadPicture();        
    }
  }
  
  uploadPicture(): void {
    const formData = new FormData();
    formData.append('profile_image', this.formGroup.get('profile_image')?.value);
    formData.append('id', this.formGroup.get('id')?.value);

    const sb = this.contactService.uploadPicture(formData).pipe(
    map((res: any) => {
      if(res.type === 'error') {
        this.hasError = true;
        this.hasError = res.message;;
      } else {
        this.hasError = false;
      }
      setTimeout(() => {
        this.loadContact(); 
        this.cdr.detectChanges();  
      }, 100);     
    }),
    ).subscribe();
    this.subscriptions.push(sb);   
  }  
  
  deletePicture(): void {
    const sbDelete = this.contactService.deletePicture(this.contact.id).pipe(
      map((res) => {
        //this.category.file_name = '';
        this.loadContact();
        this.cdr.detectChanges();
      }),
      catchError((err) => {
        console.error('DELETE ERROR', err);
        return of(undefined);
      }),
    ).subscribe();
    this.subscriptions.push(sbDelete); 
  }   

  getPicture() {
    if (!this.contact.profile_image) {
      return 'none';
    }
    return `url('${this.contact.profile_image}')`;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

}
