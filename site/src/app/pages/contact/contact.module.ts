import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// 3rd-Party plugins variables
import { AngularSvgIconModule } from 'angular-svg-icon';
import { QuillModule } from 'ngx-quill';

import { ContactRoutingModule } from './contact-routing.module';
import { ContactComponent } from './contact.component';

import { CoreModule } from '../../core';


@NgModule({
  declarations: [
    ContactComponent
  ],
  imports: [
    CommonModule,
    ContactRoutingModule,
    FormsModule, 
    ReactiveFormsModule,
    AngularSvgIconModule.forRoot(),
    QuillModule.forRoot(),
    CoreModule
  ]
})
export class ContactModule { }
