import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AlertController, ToastController } from '@ionic/angular';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { File } from '@ionic-native/file/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';

import { Observable } from 'rxjs';

import { BackgroundMode } from '@ionic-native/background-mode/ngx'
import { DataService } from 'src/app/services/data/data.service';
import { Router } from '@angular/router';
import { FileMetaInfo, FirebaseDBService } from 'src/app/services/firebase-db/firebase-db.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  providers: [FileChooser, File, FilePath, BackgroundMode]
})
export class UploadComponent implements OnInit {

  // Tutorial for file upload
  // https://www.youtube.com/watch?v=3f0oLzDazS0 

  task: AngularFireUploadTask;

  progress: Observable<number>; // Observable 0 to 100
  
  @Output() 
  progressChange: EventEmitter<number> = new EventEmitter<number>();  

  mp3: string; // base64

  constructor(private db: AngularFirestore, 
              private objFirebaseDBService: FirebaseDBService,
              private storage: AngularFireStorage, 
              private dataService: DataService,
              private alertCtrl: AlertController, 
              private toastCtrl: ToastController,
              private fileChooser: FileChooser,
              private objFile: File,
              private objFilePath: FilePath,
              private backgroundMode: BackgroundMode,
              private objRouter: Router) { }

  ngOnInit() {

  }

  chooseMP3() {
    let _me_ = this;

    this.objRouter.navigateByUrl("/tabs/(my-music:my-music)");
    this.fileChooser.open().then(uri => {
      //alert(uri);

      _me_.objFile.resolveLocalFilesystemUrl(uri).then(fileSysURL => {
        //alert(JSON.stringify(fileSysURL));
        console.log("New URL Object: " + JSON.stringify(fileSysURL));

        _me_.objFilePath.resolveNativePath(uri) 
        .then(filePath => {
          //alert('Native Path: ' + filePath);

          let dirPath = filePath;
          let dirPathSegments = dirPath.split('/'); // Break the string to an array
        
          let fileName = dirPathSegments.pop(); // Remove last item from array
          dirPath = dirPathSegments.join('/');

          _me_.objFile.readAsArrayBuffer(dirPath, fileName).then(async buffer => {
            _me_.dataService.setMP3UploadProgress(0);
            await _me_.uploadMP3(buffer, fileSysURL.name);
          }).catch(error => {
            alert('Read Array Buffer: ' + JSON.stringify(error));
            console.log(error);
          });
        })
        .catch(err => {
          alert('Resolve Native Path : ' + err);
          console.log(err)
        });
        
      }).catch(error => {
        alert('Local file system URL: ' + JSON.stringify(error));
        console.log(error);
      });
    }).catch(error => {
      alert('File open error: ' + JSON.stringify(error));
      console.log(error);
    });
  }

  async uploadMP3(buffer, name) {
    let _me_ = this;
    
    let userID = `${this.dataService.getProfileData().handle}`;
    let sAlbum = "default";
    let blob = new Blob([buffer], {type: 'audio/mpeg'});
    let fullPath = `${userID}/`+`${sAlbum}`+`/${new Date().getTime()}-`+name;

    this.backgroundMode.enable();
    this.task = this.storage.ref(fullPath).put(blob);

    this.progress = this.task.percentageChanges();
    this.progress.subscribe(value => {
      _me_.dataService.setMP3UploadProgress(value);

      if(value == 100) {
        this.backgroundMode.disable();

        let toSave = {
          createdAt:    `${Date.now()}`,
          fileName:     name,
          customName:   name,
          albumName:    sAlbum,
          fullPath:     fullPath,
          contentType:  'audio/mpeg'
        };
        _me_.storeInfoToDatabase(toSave);
      }
    });
  }

  storeInfoToDatabase(metaInfo: FileMetaInfo) {
    let userID = `${this.dataService.getProfileData().handle}`;

    this.objFirebaseDBService.saveMyMP3(userID, metaInfo);
  }
}
