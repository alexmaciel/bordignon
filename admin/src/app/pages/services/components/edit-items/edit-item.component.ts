import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, finalize, first } from 'rxjs/operators';
import { Observable, of, Subscription } from 'rxjs';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditorChangeContent, EditorChangeSelection } from 'ngx-quill';

import { AuthService } from '../../../../modules/auth';

import { ServicesService } from '../../services/services.service';
import { Services } from '../../models/services.model';

const EMPTY_SERVCES: Services = {
  id: 0,
  name: '',
  description: '',
};

@Component({
  selector: 'app-edit-item',
  templateUrl: './edit-item.component.html',
})
export class EditItemComponent implements OnInit, OnDestroy {
  @Input() id!: number;

  isLoading$?: Observable<boolean>;
  
  staffid?: number;
  services!: Services;

  formGroup!: FormGroup;

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    public modal: NgbActiveModal,
    // Services 
    private adminService: AuthService,
    public servicesService: ServicesService,
  ) { 
    this.staffid = this.adminService.currentUserValue?.staffid;
  }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems() {
    if (!this.id) {
      this.services = EMPTY_SERVCES;
      this.loadForm();
    } else {
      const sb = this.servicesService.getItemById(this.id).pipe(
        first(),
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(EMPTY_SERVCES);
        })
      ).subscribe((res: Services) => {
        this.services = res as Services;
        this.loadForm();
      });
      this.subscriptions.push(sb);
    }
  }

  loadForm() {
    this.formGroup = this.fb.group({
      name: [this.services.name, Validators.compose([
        Validators.required, 
        Validators.minLength(3)
      ])],
      description: [this.services.description, Validators.compose([
        Validators.required, 
        Validators.minLength(3)
      ])],
      staffid: [this.staffid],
    });
  }  

  save() {
    const formValues = this.formGroup.value;
    this.services = Object.assign(this.services, formValues);
    if (this.services.id) {
      this.edit();
    } else {
      this.create();
    }
  }

  edit() {
    const sbUpdate = this.servicesService.update(this.services).pipe(
      finalize(() => {
        this.modal.close();
      }),
      catchError((errorMessage) => {
        this.modal.dismiss(errorMessage);
        return of(this.services);
      }),
    ).subscribe();
    this.subscriptions.push(sbUpdate);
  }

  create() {
    const sbCreate = this.servicesService.create(this.services).pipe(
      finalize(() => {
        this.modal.close();
      }),
      catchError((errorMessage) => {
        this.modal.dismiss(errorMessage);
        return of(this.services);
      }),
    ).subscribe();
    this.subscriptions.push(sbCreate);
  }

  changedEditor(event: EditorChangeContent | EditorChangeSelection) {
    // tslint:disable-next-line:no-console
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
 
}
