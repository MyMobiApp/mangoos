import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

import { SettingsPage } from '../../settings/settings.page';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() sTitle: string = "";

  constructor(public popoverCtrl: PopoverController) { }

  ngOnInit() {
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: SettingsPage,
      event: ev,
      translucent: true
    });
    return await popover.present();
  }

  close() {
    this.popoverCtrl.dismiss();
  }

}
