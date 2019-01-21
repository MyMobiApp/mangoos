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

  offset: string = null;
  limit: number = 50;

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
  }

  onFeedDone(event) {
    this.doRefresh(null);
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter get music files.');
    this.getMusicFiles();
  }

  doRefresh(event) {
    //console.log('Begin async Refresh operation', event);
    this.offset = null;
    this.mp3List = null;

    this.getMusicFiles();
    setTimeout(()=> {
      if(event) {
        event.target.complete();
      }
    }, 2500);
    
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

  async getMusicFiles(event?: any) {
    let _me_ = this;
    const handle = this.objDataService.getProfileData().handle;
    
    _me_.bLoading = true;
    await this.objFirestoreDBService.getMusicMetaInfoList(handle, 'default', _me_.offset, _me_.limit)
    .subscribe(list => {
      if(list.length > 0) {
        const listLength: number = _me_.mp3List ? _me_.mp3List.length : 0;

        _me_.offset = list[list.length - 1].createdAt;
        _me_.mp3List = _me_.mp3List ? _me_.mp3List.concat(list) : list;

        //_me_.mp3List.sort(_me_.compare);
        //console.log(list);
        //console.log(_me_.mp3List);

        for(let key in list) {
          if(list[key].hasOwnProperty('metaData') && 
            list[key].metaData.common.hasOwnProperty('picture') && 
            list[key].metaData.common.picture[0].hasOwnProperty('data')) {
              let imgBlob = <firebase.firestore.Blob>list[key].metaData.common.picture[0].data;
            
              _me_.mp3List[listLength + parseInt(key)].thumbnail = _me_.objDataService.imgSrc(list[key].metaData.common.picture[0].format, imgBlob.toBase64());
              //.log(_me_.mp3List[listLength + + parseInt(key)].thumbnail);
          }
          let date = new Date(_me_.mp3List[key].createdAtISO);
          _me_.mp3List[key].createdAtISO = date.toLocaleDateString();
          //console.log(_me_.mp3List[key]);
        }
      }
      
      if(event) {
        event.target.complete();
        if(list.length == 0) {
          event.target.disabled = true;
        }
      }

      _me_.bLoading = false;
    }, err => {
      _me_.bLoading = false;
      alert(err);
      console.log("Error getMusicFileList : " + err);
    });
  }

  async getMusicFiles_old() {
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
            
              _me_.mp3List[key].thumbnail = _me_.objDataService.imgSrc(_me_.mp3List[key].data.metaData.common.picture[0].format, imgBlob.toBase64());
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
      componentProps: {'metaInfo' : _me_.popoverData, 'popoverObj' : this.popoverCtrl},
      event: ev,
      translucent: true
    });
    popover.onDidDismiss().then(bDone => {
      if(bDone) {
        _me_.doRefresh(null);
      }
    }).catch(err => {
      console.log("Popover Error : " + err);
    });
    
    return await popover.present();
  }

  close() {
    this.popoverCtrl.dismiss();
  }

  compare(a: any, b: any) {
    if (a.customName < b.customName)
      return -1;
    if (a.customName > b.customName)
      return 1;
    return 0;
  }
  
  fetchFeedItems(event) {
    this.getMusicFiles(event);
  }
}
