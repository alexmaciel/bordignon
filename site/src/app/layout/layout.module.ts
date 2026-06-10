import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// 3rd-Party plugins variables
import { AngularSvgIconModule } from 'angular-svg-icon';

// Components
import { WhatsappComponent } from './components/whatsapp/whatsapp.component';
import { ContentComponent } from './components/content/content.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AsideComponent } from './components/aside/aside.component';
// Cookies
import { CookiesComponent } from "./components/cookies/cookies.component";

import { ScriptsInitComponent } from './components/scripts-init/scripts-init.component';

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';

import { CoreModule } from "../core";

@NgModule({
  declarations: [
    LayoutComponent,
    // Script
    ScriptsInitComponent,
    // Componets
    WhatsappComponent,
    ContentComponent,
    HeaderComponent,
    FooterComponent,
    AsideComponent
  ],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    AngularSvgIconModule.forRoot(),
    CoreModule,
    // Cookies
    CookiesComponent,      
  ]
})
export class LayoutModule { }
