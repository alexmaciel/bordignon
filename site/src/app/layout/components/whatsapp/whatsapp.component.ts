import { Component } from '@angular/core';

import { 
  SettingService, 
} from '../../../core';

@Component({
  selector: 'app-whatsapp',
  templateUrl: './whatsapp.component.html',
})
export class WhatsappComponent {

  constructor(
    public settings: SettingService,
  ) {}
}
