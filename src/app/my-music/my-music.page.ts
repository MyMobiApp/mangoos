import { Component } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { map } from 'rxjs/operators';
import { AlertController, ToastController } from '@ionic/angular';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { File } from '@ionic-native/file/ngx';

@Component({
  selector: 'app-my-music',
  templateUrl: 'my-music.page.html',
  styleUrls: ['my-music.page.scss']
})
export class MyMusicPage {
  // Tutorial
  // https://www.youtube.com/watch?v=Pi6AtssyaNw

  constructor(private db: AngularFirestore, 
              private storage: AngularFireStorage, 
              private alertCtrl: AlertController, 
              private toastCtrl: ToastController,
              private fileChooser: FileChooser,
              private objFile: File) {

  }

  getMP3Files() {
    let ref = this.db.collection('files');

    /*return ref.snapshotChanges()
    .map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });*/
  }

  uploadToStorage( information : any ) : AngularFireUploadTask {
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
  }
}
