import { Injectable } from '@angular/core';
import { FirebaseDBService, UserProfile } from '../firebase-db/firebase-db.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private profileData: any;
  private mp3UploadProgress: number = 0;
  public  mp3UploadObservable: Observable<number>;
  private mp3UploadObserver: any;

  constructor(private fireDBService: FirebaseDBService) {
    let _me_ = this;

    this.mp3UploadObservable = Observable.create(observer => {
      _me_.mp3UploadObserver = observer;
    });

    // Dummy call, to initialize observer
    this.mp3UploadObservable.subscribe(data => {}); 
  }

  public getmp3UploadProgress() {
    return this.mp3UploadProgress;
  }

  public setMP3UploadProgress(progress: number) {
    this.mp3UploadProgress = progress;

    this.mp3UploadObserver.next(true);
  }

  public getProfileData() : UserProfile {
    //console.log("Returning ProfileData: " + JSON.stringify(this.profileData));
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
