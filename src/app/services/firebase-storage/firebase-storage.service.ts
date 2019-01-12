import { Injectable } from '@angular/core';
import { FirebaseStorage } from 'angularfire2';
import { UserProfile } from '../firebase-db/firebase-db.service';
import { AngularFireStorage } from 'angularfire2/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService {
  private userProfile: UserProfile;

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
}
