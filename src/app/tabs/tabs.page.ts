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
              public playService: PlayService) {
    
  }

  ngOnInit() {
    let _me_ = this;

    this.playService.playItemObservable.subscribe(data => {
      _me_.miniPlayer.playViaParent();
    });

    this.playService.playlistObservable.subscribe(data => {
      let playPos = this.playService.getCurrentPlayIndex();

      _me_.miniPlayer.setPlayPosViaParent(playPos);
    });

    this.playService.playStopObservable.subscribe(data => {
      //alert("Test playStopObservable");
      _me_.miniPlayer.stopViaParent();
    });
  }

  onProgressChange(progress: number) {
    this.objDataService.setMP3UploadProgress(progress);
  }
}
