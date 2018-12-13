import { Component } from '@angular/core';


@Component({
  selector: 'app-my-music',
  templateUrl: 'my-music.page.html',
  styleUrls: ['my-music.page.scss']
})
export class MyMusicPage {
  // Tutorial
  // https://www.youtube.com/watch?v=Pi6AtssyaNw

  constructor() {

  }

  /*getMP3Files() {
    let ref = this.db.collection('files');

    return ref.snapshotChanges()
    .map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });
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
  }*/
}
