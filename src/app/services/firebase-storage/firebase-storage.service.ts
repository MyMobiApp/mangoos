import { Injectable } from '@angular/core';
import { AngularFireStorage } from 'angularfire2/storage';
import { Observable } from 'rxjs';

import { IUserProfile } from '../firebase-db/firebase-db.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService {
  private userProfile: IUserProfile;

  constructor(private objFirebaseStorage: AngularFireStorage) { 
    
  }

  getMP3DownloadURL(fullPath: string) : Promise<string> {
    
    return new Promise((resolve, reject) => { 
        this.objFirebaseStorage.ref(fullPath).getDownloadURL().subscribe(url => {
          if(url) {
            //alert(url);
            resolve(url);
          }
          else {
            reject();
          }
      });
    });
  }

  deleteFile(file_path: string) : Observable <any>{
    return this.objFirebaseStorage.ref(file_path).delete();
  }
}
