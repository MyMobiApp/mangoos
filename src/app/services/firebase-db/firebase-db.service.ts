import { Injectable } from '@angular/core';
import { FirebaseOriginal } from '@ionic-native/firebase';

@Injectable({
  providedIn: 'root'
})
export class FirebaseDBService {
  objFirebase: FirebaseOriginal;

  constructor() { }

  registerUser(profileData: any) {
    //this.objFirebase.
  }
}
