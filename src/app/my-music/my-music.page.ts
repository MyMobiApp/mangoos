import { Component, NgZone, ViewChild } from '@angular/core';
import { DataService } from '../services/data/data.service';
import { FirebaseDBService, FileMetaInfo } from '../services/firebase-db/firebase-db.service';
import { PlayService } from '../services/play/play.service';
import { ToastController, PopoverController } from '@ionic/angular';

import { MP3SettingsPage } from '../mp3-settings/mp3-settings.page';
import { ProgressBarComponent } from '../common-components/progress-bar/progress-bar.component';


@Component({
  selector: 'app-my-music',
  templateUrl: 'my-music.page.html',
  styleUrls: ['my-music.page.scss']
})
export class MyMusicPage {
  // Tutorial
  // https://www.youtube.com/watch?v=Pi6AtssyaNw

  percent: any = 0;
  mp3List: any = null;
  bLoading: boolean = false;
  popoverData: any;
  @ViewChild(ProgressBarComponent) progressBar: ProgressBarComponent;
  
  constructor(private objDataService: DataService,
              private objFirestoreDBService: FirebaseDBService,
              private objPlayService: PlayService,
              private toastCtrl: ToastController,
              private popoverCtrl: PopoverController,
              private zone: NgZone) {
    let _me_ = this;

    this.objDataService.mp3UploadObservable.subscribe(data => {
      _me_.percent = Math.round(_me_.objDataService.getmp3UploadProgress());
      _me_.progressBar.progress = _me_.percent;
      //alert(_me_.percent);
    });

    this.getMP3Files();
  }

  ionViewDidEnter() {
    //alert("ionViewWillEnter");
    this.getMP3Files();
  }

  doRefresh(event) {
    //console.log('Begin async operation', event);

    this.getMP3Files();
    event.target.complete();
  }

  async addToPlaylist(id: string, mp3Data: FileMetaInfo) {
    this.objPlayService.enqueue(id, mp3Data);

    let toast = await this.toastCtrl.create({
      message: mp3Data.customName + ' added to the playlist.',
      position: 'top',
      duration: 3000
    });
    toast.present();
  }

  onSettings(id: string, mp3Data: FileMetaInfo) {
    alert("Settings Clicked");
    this.popoverData = {'id': id, 'mp3Data': mp3Data};
    //this.objPlayService.enqueue(id, mp3Data);
  }

  async getMP3Files() {
    let _me_ = this;
    let handle = this.objDataService.getProfileData().handle;

    _me_.bLoading = true;
    await this.objFirestoreDBService.getMP3List(handle, 'default').then(data => {
      _me_.mp3List = data;
      _me_.bLoading = false;
      //alert(JSON.stringify(data));
    }).catch(err => {
      alert(JSON.stringify(err));
    });
  }

  async presentPopover(ev: any) {
    let _me_ = this;

    const popover = await this.popoverCtrl.create({
      component: MP3SettingsPage,
      componentProps: _me_.popoverData,
      event: ev,
      translucent: true
    });
    return await popover.present();
  }

  close() {
    this.popoverCtrl.dismiss();
  }

  /*uploadToStorage( information : any ) : AngularFireUploadTask {
    let newName = `${new Date().getTime()}.txt`;

    return this.storage.ref('files/{newName}').putString(information);
  }

  storeInfoToDatabase(metaInfo) {
    let toSave = {
      created:      metaInfo.timeCreated,
      url:          metaInfo.downloadURLs[0],
      fullPath:     metaInfo.fullPath,
      contentType:  metaInfo.contentType
    }

    
  }

  deleteFile(file) {
    let storagePath = file.storagePath;

    this.storage.ref(storagePath).delete();
  }*/
}
