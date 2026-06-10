import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TouComponent } from './tou.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { UseComponent } from './use/use.component';

const routes: Routes = [
  {
    path: '',
    component: TouComponent,
    children: [
      {
        path: 'privacidade',
        data: {
          title: 'Privacidade',
          translate: 'nav.privacyNav'
        },          
        component: PrivacyComponent
      },
      {
        path: 'uso',
        data: {
          title: 'Termos',
          translate: 'nav.termsNav'
        },          
        component: UseComponent
      },      
      { path: '', redirectTo: 'privacidade', pathMatch: 'full' },
      { path: '**', redirectTo: 'privacidade', pathMatch: 'full' },       
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TouRoutingModule { }
