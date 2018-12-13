import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AlertController, ToastController } from '@ionic/angular';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { File } from '@ionic-native/file/ngx';

import { DataService } from 'src/app/services/data/data.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  providers: [FileChooser, File]
})
export class UploadComponent implements OnInit {

  // Tutorial for file upload
  // https://www.youtube.com/watch?v=3f0oLzDazS0 

  task: AngularFireUploadTask;

  progress: any;  // Observable 0 to 100

  mp3: string; // base64

  constructor(private db: AngularFirestore, 
              private storage: AngularFireStorage, 
              private dataService: DataService,
              private alertCtrl: AlertController, 
              private toastCtrl: ToastController,
              private fileChooser: FileChooser,
              private objFile: File) { }

  ngOnInit() {

  }

  selectMP3() {
    var mp3File: string = "";

    return mp3File
  }

  createUploadTask(file: string): void {

    const filePath = `my-pet-crocodile_${ new Date().getTime() }.jpg`;

    this.mp3 = 'data:audio/mpeg;base64,' + file;
    this.task = this.storage.ref(filePath).putString(this.mp3, 'data_url');

    this.progress = this.task.percentageChanges();
  }

  async uploadHandler() {
    const base64 = await this.selectMP3();
    this.createUploadTask(base64);
  }

  chooseMP3() {
    let _me_ = this;

    this.fileChooser.open().then(uri => {
      alert(uri);

      _me_.objFile.resolveLocalFilesystemUrl(uri).then(fileSysURL => {
        console.log("New URL Object: " + JSON.stringify(fileSysURL));

        let dirPath = fileSysURL.nativeURL;
        let dirPathSegments = dirPath.split('/'); // Break the string to an array
        
        dirPathSegments.pop(); // Remove last item from array
        dirPath = dirPathSegments.join('/');

        _me_.objFile.readAsArrayBuffer(dirPath, fileSysURL.name).then(async buffer => {
          await _me_.uploadMP3(buffer, fileSysURL.name);
        }).catch(error => {
          console.log(error);
        });
      }).catch(error => {
        console.log(error);
      });
    }).catch(error => {
      console.log(error);
    });
  }

  async uploadMP3(buffer, name) {
    let userID = `${this.dataService.getProfileData().handle}`;
    let sAlbum = "-";
    let blob = new Blob([buffer], {type: 'audio/mpeg'});

    this.task = this.storage.ref(`${userID}/`+`${sAlbum}`+`/${new Date().getTime()}-`+name).put(blob);
    /*.then(d => {
      console.log('Upload Successful');
    }).catch(error => {
      console.log(error);
    });*/

    this.progress = this.task.percentageChanges();
  }

  storeInfoToDatabase(metaInfo) {
    let toSave = {
      created:      metaInfo.timeCreated,
      url:          metaInfo.downloadURLs[0],
      fullPath:     metaInfo.fullPath,
      contentType:  metaInfo.contentType
    }

    
  }
}
