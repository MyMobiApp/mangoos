import { Injectable } from '@angular/core';
import { FirebaseDBService } from '../firebase-db/firebase-db.service';



@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  profileHandleImgMap: { [id: string] : string; } = {};

  constructor(private firebaseDBService: FirebaseDBService) { }

  getProfileImage(handle: string) : Promise<string> {
    //let key = handle.split(".").join("");
    
    return new Promise((resolve, reject) => { 
      let retVal: string;

      if(this.profileHandleImgMap.hasOwnProperty(handle)) {
        resolve(this.profileHandleImgMap[handle]);
      }
      else {
        this.firebaseDBService.getProfileImageURL(handle).then(profile_img_url => {
          this.profileHandleImgMap[handle] = profile_img_url;

          //console.log("In getProfileImage for : " + handle);
          //console.log(this.profileHandleImgMap);
          //console.log(this.profileHandleImgMap[handle]);
          //console.log(this.profileHandleImgMap.hasOwnProperty(handle));

          resolve(this.profileHandleImgMap[handle]);
        }).catch(error => {

          reject(error);

        });
      }
    });
  }
}
