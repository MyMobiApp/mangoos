import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AlertController, ToastController } from '@ionic/angular';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { Chooser, ChooserResult } from '@ionic-native/chooser/ngx';
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
  providers: [Chooser, FileChooser, File, FilePath, BackgroundMode]
})
export class UploadComponent implements OnInit {

  // Tutorial for file upload
  // https://www.youtube.com/watch?v=3f0oLzDazS0 

  task: AngularFireUploadTask;

  progress: Observable<number>; // Observable 0 to 100
  
  @Output() 
  progressChange: EventEmitter<number> = new EventEmitter<number>();  

  mp3: string; // base64

  constructor(private dataService: DataService,
              private objFirebaseDBService: FirebaseDBService,
              private db: AngularFirestore, 
              private storage: AngularFireStorage, 
              //private alertCtrl: AlertController, 
              //private toastCtrl: ToastController,
              private fileChooser: FileChooser,
              private chooser: Chooser,
              private objFile: File,
              private objFilePath: FilePath,
              private backgroundMode: BackgroundMode,
              private objRouter: Router) { }

  ngOnInit() {

  }

  /*
  * Function to choose file, can't apply MIME filter also we can't determine
  * which file (MIME type) is selected.
  * 
  * [NOT USING THIS FUNCTION, RATHER USING CHOOSER PLUGIN. CHECK newChooseMP3() BELOW]
  * 
  */
  chooseMP3() {
    let _me_ = this;

    this.objRouter.navigateByUrl("/tabs/(my-music:my-music)");
    this.fileChooser.open().then(uri => {
      alert(uri);

      _me_.objFile.resolveLocalFilesystemUrl(uri).then(fileSysURL => {
        alert(JSON.stringify(fileSysURL));
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
            _me_.progressChange.emit(0);
            await _me_.uploadMP3(buffer, fileSysURL.name, 'audio/mpeg');
          }).catch(error => {
            alert('Read Array Buffer: ' + error);
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

  async uploadMP3(buffer, name, mimeType) {
    let _me_ = this;
    
    let userID = this.dataService.getProfileData().handle;
    let sAlbum = "default";
    let blob = new Blob([buffer], {type: mimeType});
    let fullPath = `${userID}/`+`${sAlbum}`+`/${new Date().getTime()}-`+name;

    var objDate = new Date();
    let toSave = {
      createdAt:    `${Date.now()}`,
      createdAtISO: `${objDate.toISOString()}`,
      fileName:     name,
      customName:   name,
      albumName:    sAlbum,
      fullPath:     fullPath,
      contentType:  mimeType,
      feedID:       null,
      metaData:     null
    };

    _me_.storeInfoToDatabase(toSave).then(docRef =>{
      let feedItem = {
        doc_id:           docRef.id,
        db_path:          docRef.path,
        message:          "",
        profile_handle:   this.dataService.getProfileData().handle,
        full_name:        this.dataService.getProfileData().full_name,
        post_datetime:    (new Date()).toISOString(),
        post_dateobj:     Date.now(),
        likes:            0,
        feed_status:      1,
        feed_removed_date:    null,
        feed_removed_reason:  null
      };      
      _me_.dataService.setPublicFeedItem(feedItem);
      
      // Enable background mode.
      _me_.backgroundMode.enable();
      
      // Trigger indicating upload initiated
      _me_.dataService.setMP3UploadProgress(0);
      
      // Start upload, and track upload progress
      _me_.task = _me_.storage.ref(fullPath).put(blob);
      
      _me_.progress = _me_.task.percentageChanges();
      _me_.progress.subscribe(value => {
        _me_.dataService.setMP3UploadProgress(value);
        if(value == 100) {
          // Upload completes: Disable background mode.
          _me_.backgroundMode.disable();
          alert("Upload completes");
        }
        //alert(value);
      }, (error) => {
        _me_.backgroundMode.disable();
        _me_.objFirebaseDBService.deleteDocWithRef(docRef);
        console.log("Error: " + error);
      });
    }).catch(error => {
      alert(error);
      console.log("Error: " + error);
    });
  }

  storeInfoToDatabase(metaInfo: FileMetaInfo) : Promise<firebase.firestore.DocumentReference> {
    let userID = `${this.dataService.getProfileData().handle}`;

    return this.objFirebaseDBService.saveMyMP3(userID, metaInfo);
  }

  /*
  * Function to choose any audio file, can apply MIME filter also we can determine
  * which file (MIME type) is selected.
  */
  newChooseMP3() {
    let _me_ = this;

    this.objRouter.navigateByUrl("/tabs/(my-music:my-music)");
    (async () => {
      // With ionic 4 calling getFile function from object were not returning promise properly.
      // So used this way. May be in next plugin release this gets fixed, till then this is the solution.
      // Supported file formats by music-metadata plugins are,
      // 'audio/mpeg' | 'audio/apev2' | 'audio/mp4' | 'audio/asf' | 'audio/flac' | 'audio/ogg' | 'audio/aiff' | 'audio/wavpack' | 'audio/riff' | 'audio/musepack'
      // ----
      const fileInfo: ChooserResult = await (<any>window).chooser
      .getFile("audio/mpeg,audio/apev2,audio/mp4,audio/asf,audio/flac,audio/ogg,audio/aiff,audio/wavpack,audio/riff,audio/musepack");
      //alert(fileInfo.uri);
      
      _me_.objFile.resolveLocalFilesystemUrl(fileInfo.uri).then(fileSysURL => {
        //alert(JSON.stringify(fileSysURL));
        
        _me_.objFilePath.resolveNativePath(fileInfo.uri) 
        .then(filePath => {
          //alert('Native Path: ' + filePath);

          let dirPath = filePath;
          let dirPathSegments = dirPath.split('/'); // Break the string to an array
        
          let fileName = dirPathSegments.pop(); // Remove last item from array
          dirPath = dirPathSegments.join('/');

          _me_.objFile.readAsArrayBuffer(dirPath, fileName).then(async buffer => {
            _me_.dataService.setMP3UploadProgress(0);
            _me_.progressChange.emit(0);
            await _me_.uploadMP3(buffer, fileSysURL.name, fileInfo.mediaType).then(() => {
              _me_.progressChange.emit(100);
            });
          }).catch(error => {
            //alert('Read Array Buffer: ' + error);
            alert('Error reading file, try with different file.')
            console.log(error);
          });
        })
        .catch(err => {
          alert("Can't resolve native path : " + err);
          console.log(err)
        });
        
      }).catch(error => {
        alert("Can't resolve local file system URL: " + error);
        console.log(error);
      });
    })();
  }
}
