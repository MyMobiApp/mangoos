import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PopoverController } from '@ionic/angular';

import { SettingsPage } from '../../settings/settings.page';

type PageType = "feed" | false;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() sTitle: string = "";
  @Input() page: PageType = false;

  @Output() onRefresh = new EventEmitter();

  constructor(private popoverCtrl: PopoverController) { }

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

  doRefresh() {
    this.onRefresh.emit(true);
  }

  close() {
    this.popoverCtrl.dismiss();
  }

}
