import { Component, NgZone, ViewChild } from '@angular/core';
import { DataService } from '../services/data/data.service';
import { FirebaseDBService, FileMetaInfo } from '../services/firebase-db/firebase-db.service';
import { PlayService } from '../services/play/play.service';
import { ToastController, PopoverController } from '@ionic/angular';

import { MP3SettingsPage } from '../mp3-settings/mp3-settings.page';
import { ProgressBarComponent } from '../common-components/progress-bar/progress-bar.component';

import { DomSanitizer } from '@angular/platform-browser';

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
              private sanitizer : DomSanitizer,
              private zone: NgZone) {
    
  }

  ngOnInit() {
    let _me_ = this;

    this.objDataService.uploadEvent().subscribe(data => {
      _me_.percent = Math.round(_me_.objDataService.getmp3UploadProgress());
      _me_.progressBar.progress = _me_.percent;

      if(_me_.percent == 0) {
        _me_.progressBar.bUploading = true;
      }

      if(_me_.percent > 0) {
        _me_.progressBar.bStarting = false;
      }
    });

    this.getMusicFiles();
  }

  ionViewDidEnter() {
    
  }

  doRefresh(event) {
    //console.log('Begin async operation', event);

    this.getMusicFiles();
    event.target.complete();
  }

  async addToPlaylist(id: string, img: any, mp3Data: any) {
    this.objPlayService.enqueue(id, img, mp3Data);

    let title = mp3Data.hasOwnProperty('metaData') ? mp3Data.metaData.common.title : mp3Data.customName;

    let toast = await this.toastCtrl.create({
      message: title + ' added to the playlist.',
      position: 'top',
      duration: 3000
    });
    toast.present();
  }

  onSettings(id: string, mp3Data: FileMetaInfo) {
    //alert("Settings Clicked");
    this.popoverData = {'id': id, 'mp3Data': mp3Data};
    //this.objPlayService.enqueue(id, mp3Data);
  }

  imgSrc(format, base64data) {
    return this.sanitizer.bypassSecurityTrustUrl('data:'+format+';base64,' + base64data);
  }

  async getMusicFiles() {
    let _me_ = this;
    let handle = this.objDataService.getProfileData().handle;

    _me_.bLoading = true;
    await this.objFirestoreDBService.getMusicFileList(handle, 'default').then(data => {
      _me_.mp3List = data;
      _me_.mp3List.sort(_me_.compare);

      for(let key in _me_.mp3List) {
        if(_me_.mp3List[key].data.hasOwnProperty('metaData') && 
           _me_.mp3List[key].data.metaData.common.hasOwnProperty('picture') && 
           _me_.mp3List[key].data.metaData.common.picture[0].hasOwnProperty('data')) {
              let imgBlob = <firebase.firestore.Blob>_me_.mp3List[key].data.metaData.common.picture[0].data;
            
              _me_.mp3List[key].thumbnail = _me_.imgSrc(_me_.mp3List[key].data.metaData.common.picture[0].format, imgBlob.toBase64());
              //console.log(_me_.mp3List[key].thumbnail);
        }
        //console.log(_me_.mp3List[key]);
      }
      
    }).catch(err => {
      alert(err);
      console.log("Error getMusicFileList : " + err);
    }).finally(() => {
      _me_.bLoading = false;
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

  compare(a: any, b: any) {
    if (a.data.customName < b.data.customName)
      return -1;
    if (a.data.customName > b.data.customName)
      return 1;
    return 0;
  }
  
  /*
  deleteFile(file) {
    let storagePath = file.storagePath;

    this.storage.ref(storagePath).delete();
  }*/
}
