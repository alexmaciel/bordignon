import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SocialComponent } from './social.component';

const routes: Routes = [
  {
    path: '',
    data: {
      translate: 'nav.socialNav',
      breadcrumb: 'nav.listNav'       
    },       
    component: SocialComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SocialRoutingModule { }
