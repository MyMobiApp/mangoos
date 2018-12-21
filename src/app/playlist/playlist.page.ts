import { Component } from '@angular/core';
import { PlayService } from '../services/play/play.service';

@Component({
  selector: 'app-playlist',
  templateUrl: 'playlist.page.html',
  styleUrls: ['playlist.page.scss']
})
export class PlaylistPage {
  private playlist: any;

  constructor(private objPlayService: PlayService) {
    let _me_ = this;

    this.objPlayService.playlistObservable.subscribe(data => {
      _me_.loadPlaylist();
      alert(JSON.stringify(this.playlist));
    });

    _me_.loadPlaylist();
    alert(JSON.stringify(this.playlist));
  }

  loadPlaylist() {
    this.playlist = this.objPlayService.playlist.map(x => Object.assign({}, x));
  }

  onReorderPlaylist(indexes){
    this.objPlayService.moveTo(indexes);

    this.loadPlaylist();

    alert(JSON.stringify(this.playlist));
  }

  Play(mp3Obj) {
    this.objPlayService.setCurrentMP3(mp3Obj, true);
  }
}
