import { Component, ViewChild } from '@angular/core';
import { DataService } from '../services/data/data.service';
import { MiniPlayerComponent } from '../common-components/mini-player/mini-player.component';
import { PlayService } from '../services/play/play.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  @ViewChild(MiniPlayerComponent) miniPlayer: MiniPlayerComponent;

  constructor(private objDataService: DataService, 
              private playService: PlayService) {
    this.playService.playItemObservable.subscribe(data => {
      this.miniPlayer.playViaParent();
    });

    this.playService.playlistObservable.subscribe(data => {
      let playPos = this.playService.getCurrentPlayIndex();

      this.miniPlayer.setPlayPosViaParent(playPos);
    });

    this.playService.playStopObservable.subscribe(data => {
      this.miniPlayer.stopViaParent();
    });
  }

  onProgressChange(progress: number) {
    this.objDataService.setMP3UploadProgress(progress);
  }
}
