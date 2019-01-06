import { Component } from '@angular/core';
import { PlayService } from '../services/play/play.service';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-playlist',
  templateUrl: 'playlist.page.html',
  styleUrls: ['playlist.page.scss']
})
export class PlaylistPage {

  // Tutorial on reorder
  // https://www.youtube.com/watch?v=8kZTK32PuIg

  private playlist: any;
  private nCurrentPlayIndex: number = undefined;

  constructor(private objPlayService: PlayService,
              private alertCtrl: AlertController) {
    let _me_ = this;

    _me_.loadPlaylist();
    //_me_.nCurrentPlayIndex = _me_.objPlayService.getCurrentPlayIndex();
  }

  ngOnInit() {
    let _me_ = this;

    this.objPlayService.playlistObservable.subscribe(data => {
      _me_.nCurrentPlayIndex = _me_.objPlayService.getCurrentPlayIndex();

      _me_.loadPlaylist();
    });
  }

  loadPlaylist() {
    this.playlist = this.objPlayService.playlist.map(x => Object.assign({}, x));
  }

  onReorderPlaylist(indexes){
    //console.log("Pre: \n" + JSON.stringify(this.playlist));
    this.objPlayService.moveTo(indexes);
    
    this.loadPlaylist();
    
    indexes.detail.complete();

    //console.log("Post: \n" + JSON.stringify(this.playlist));
  }

  Play(mp3Obj) {
    this.objPlayService.setCurrentMP3(mp3Obj, true);
  }

  async onRemoveFromPlaylist(mp3Obj) {
    let alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: 'Do you want to remove "'+ mp3Obj.mp3Data.customName + '" mp3 from playlist?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Confirm',
          handler: () => {
            this.objPlayService.dequeue(mp3Obj.id);
            console.log('Confirm clicked');
          }
        }
      ]
    });
    await alert.present();
  }
}
