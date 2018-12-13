import { Injectable } from '@angular/core';
import { FirebaseDBService, UserProfile } from '../firebase-db/firebase-db.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private profileData: any;

  constructor(private fireDBService: FirebaseDBService) { }

  public getProfileData() : UserProfile {
    console.log("Returning ProfileData: " + JSON.stringify(this.profileData));
    return this.profileData;
  }

  public setProfileData(pd: any) {
    this.profileData = Object.assign({}, pd);
    
    console.log("Set ProfileData: " + JSON.stringify(this.profileData));
    this.fireDBService.registerUser(pd);
  }

  public saveProfileData(pd: any) {
    this.profileData = Object.assign({}, pd);
    
    console.log("Saved ProfileData: " + JSON.stringify(this.profileData));
  }

  public addNewProfileData(pd: UserProfile) {
    this.profileData = Object.assign({}, pd);

    this.fireDBService.registerUser(pd);
  }

  public updateProfileData(pd: any) {
    this.profileData = Object.assign({}, pd);
  }
}
