import { Component, Input } from '@angular/core';
import { ChildrenOutletContexts } from '@angular/router';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html', 
})
export class ContentComponent {
  @Input() appContentContainer?: 'fixed' | 'fluid';
  @Input() appContentContainerClass: string = '';

  constructor(private contexts: ChildrenOutletContexts) {}

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
