import { Component } from '@angular/core';
import { DataService } from '../services/data/data.service';
import { FirebaseDBService, FileMetaInfo } from '../services/firebase-db/firebase-db.service';
import { PlayService } from '../services/play/play.service';


@Component({
  selector: 'app-my-music',
  templateUrl: 'my-music.page.html',
  styleUrls: ['my-music.page.scss']
})
export class MyMusicPage {
  // Tutorial
  // https://www.youtube.com/watch?v=Pi6AtssyaNw

  percent: any = 0;
  mp3List: any;
  
  constructor(private objDataService: DataService,
              private objFirestoreDBService: FirebaseDBService,
              private objPlayService: PlayService) {
    let _me_ = this;

    this.objDataService.mp3UploadObservable.subscribe(data => {
      _me_.percent = _me_.objDataService.getmp3UploadProgress().toFixed(0);
    });

    this.getMP3Files();
  }

  ionViewDidEnter() {
    //alert("ionViewWillEnter");
    this.getMP3Files();
  }

  addToPlaylist(id: string, mp3Data: FileMetaInfo) {
    this.objPlayService.enqueue(id, mp3Data);
  }

  onSettings(id: string, mp3Data: FileMetaInfo) {
    alert("Settings Clicked");
    //this.objPlayService.enqueue(id, mp3Data);
  }

  getMP3Files() {
    let _me_ = this;
    let handle = this.objDataService.getProfileData().handle;

    this.objFirestoreDBService.getMP3List(handle, 'default').then(data => {
      _me_.mp3List = data;
      //alert(JSON.stringify(data));
    }).catch(err => {
      alert(JSON.stringify(err));
    });
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
