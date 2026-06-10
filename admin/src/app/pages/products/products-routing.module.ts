import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OverviewComponent } from './overview/overview.component';

import { ProductsListComponent } from './products-list/products-list.component';
import { ProductsEditComponent } from './products-edit/products-edit.component';
import { ProductsComponent } from './products.component';


const routes: Routes = [
  {
    path: '',
    data: {
      translate: 'nav.productsNav',
    },
    component: ProductsComponent,
    children: [
      {
        path: 'overview',
        data: {
          translate: 'nav.productsNav',
          breadcrumb: 'nav.overviewNav',
        },         
        component: OverviewComponent,
      },    
      {
        path: 'list',
        data: {
          translate: 'nav.productsNav',
          breadcrumb: 'nav.listNav',
        },            
        component: ProductsListComponent
      },  
      {
        path: 'add',
        data: {
          translate: 'nav.productsNav',
          breadcrumb: 'nav.addNav'
        },           
        component: ProductsEditComponent
      },          
      {
        path: 'edit/:id',
        data: {
          translate: 'nav.productsNav',
          breadcrumb: 'nav.editNav'
        },         
        component: ProductsEditComponent
      },       
      { path: '', redirectTo: 'overview', pathMatch: 'full' }, 
      { path: '**', redirectTo: 'overview', pathMatch: 'full' },      
    ]    
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TechnologyRoutingModule { }
