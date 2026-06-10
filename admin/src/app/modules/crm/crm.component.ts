import { AfterContentChecked, Component } from '@angular/core';


import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ComposerComponent } from './components/composer/composer.component';

@Component({
  selector: 'app-crm',
  templateUrl: './crm.component.html',
})
export class CrmComponent implements AfterContentChecked {


  constructor(
    private modalService: NgbModal,
  ) { }
  
  ngAfterContentChecked(): void {    
    setTimeout(() => {
      //this.pageInfo.updateTitle('CRM');
    }, 1);
  }

  composer() {
    const modalRef = this.modalService.open(ComposerComponent, { 
      windowClass: 'modal-sticky modal-sticky-lg modal-sticky-bottom-end',
      size: 'lg',
      scrollable: true,
      backdrop: false
     });
  }  
}
