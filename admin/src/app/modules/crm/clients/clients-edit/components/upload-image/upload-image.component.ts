import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, map } from 'rxjs/operators';
import { Observable, of, Subscription } from 'rxjs';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { SettingsService, Settings } from '../../../../../../core';

import { ClientsService } from '../../../../services/clients.service';
import { Clients } from '../../../../models/clients.model';

import { DeleteImageComponent } from '../delete-image/delete-image.component';

@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
})
export class UploadImageComponent implements OnInit, OnDestroy {
  @Input() client!: Clients;

  settings$!: Observable<Settings>;
  isLoading$: Observable<boolean>;
  hasError: boolean = false;

  file: File;
  file_name = '';

  formGroup: FormGroup;

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder, 
    private cdr: ChangeDetectorRef,  
    private modalService: NgbModal,
    // Services
    private settings: SettingsService,   
    private clientsService: ClientsService,  
  ) { }

  ngOnInit(): void {
    this.isLoading$ = this.clientsService.isLoading$;
    this.settings$ = this.settings.settings$;

    this.loadForm();
  }

  loadClient() {
    const sb = this.clientsService.getItemById(this.client.userid).pipe()
    .subscribe(res => {
      this.client = res as Clients;
      this.cdr.detectChanges();
    });
    this.subscriptions.push(sb);
  }

  loadForm() {
    if (!this.client) {
      return;
    } 

    this.formGroup = this.fb.group({
      file: [this.client.logo_image],
      id: [this.client.userid],
    });
  }        

  onSelectedFile(event: any) {
    if(event.target.files.length) {
      const file = event.target.files[0];
      this.formGroup.get('file')?.setValue(file);
      this.uploadPicture();        
    }
  }
  
  uploadPicture(): void {
    const formData = new FormData();
    formData.append('file', this.formGroup.get('file')?.value);
    formData.append('id', this.formGroup.get('id')?.value);

    const sb = this.clientsService.uploadPicture(formData).pipe(
    map((res: any) => {
      if(res.type === 'error') {
        this.hasError = true;
        this.hasError = res.message;;
      } else {
        this.hasError = false;
      }
      setTimeout(() => {
        this.loadClient();
        this.cdr.detectChanges();  
      }, 100);   
    }),
    ).subscribe();
    this.subscriptions.push(sb);   
  }  
  
  delete() {
    const modalRef = this.modalService.open(DeleteImageComponent);
    modalRef.componentInstance.id = this.client.userid;
    modalRef.result.then(() => this.loadClient(), () => {});
  } 


  getPicture() {
    if (!this.client.logo_image) {
      return 'none';
    }
    return `url('${this.client.folder}${this.client.logo_image}')`;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

}
