import { Component } from '@angular/core';
import { DataService } from '../services/data/data.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  constructor(private objDataService: DataService) {

  }

  onProgressChange(progress: number) {
    this.objDataService.setMP3UploadProgress(progress);
  }
}
