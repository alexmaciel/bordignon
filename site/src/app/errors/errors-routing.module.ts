import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ErrorsComponent } from './errors.component';
import { Error404Component } from './error404/error404.component';
import { Error500Component } from './error500/error500.component';

const routes: Routes = [
  {
    path: '',
    component: ErrorsComponent,
    children: [
      {
        path: '404',
        data: {
          title: '404',
        },          
        component: Error404Component,
      },
      {
        path: '500',
        data: {
          title: '500',
        },          
        component: Error500Component,
      },
      { path: '', redirectTo: '404', pathMatch: 'full' },
      { path: '**', redirectTo: '404', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ErrorsRoutingModule {}
