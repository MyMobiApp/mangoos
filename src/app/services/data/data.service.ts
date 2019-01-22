import { Injectable } from '@angular/core';
import { FirebaseDBService, IUserProfile, IFeedItem } from '../firebase-db/firebase-db.service';
import { Observable } from 'rxjs';

import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private profileData: any;
  private feedItem: IFeedItem = null;
  private mp3UploadProgress: number = 0;
  private mp3UploadObservable: Observable<number>;
  private mp3UploadObserver: any;

  constructor(private fireDBService: FirebaseDBService, private sanitizer: DomSanitizer) {
    let _me_ = this;

    this.mp3UploadObservable = Observable.create(observer => {
      _me_.mp3UploadObserver = observer;
    });

    // Dummy call, to initialize observer
    this.mp3UploadObservable.subscribe(data => {}); 
  }

  ngOnInit() {
    
  }

  public uploadEvent() {
    return this.mp3UploadObservable;
  }

  public getmp3UploadProgress() {
    return this.mp3UploadProgress;
  }

  public setPublicFeedItem(feedItem: IFeedItem) {
    this.feedItem = feedItem;
  }

  public getPublicFeedItem() : IFeedItem {
    return this.feedItem;
  }

  public setMP3UploadProgress(progress: number) {
    this.mp3UploadProgress = progress;

    this.mp3UploadObserver.next(progress);
    //alert("In setMP3UploadProgress : "+ progress);
  }

  public getProfileData() : IUserProfile {
    //console.log("Returning ProfileData: " + JSON.stringify(this.profileData));
    return this.profileData;
  }

  public saveProfileData(pd: any) {
    this.profileData = Object.assign({}, pd);
    
    console.log("Set ProfileData: " + JSON.stringify(this.profileData));
    this.fireDBService.registerUser(pd);
  }

  public setProfileData(pd: any) {
    this.profileData = Object.assign({}, pd);
    
    console.log("Saved ProfileData: " + JSON.stringify(this.profileData));
  }

  public addNewProfileData(pd: IUserProfile) {
    this.profileData = Object.assign({}, pd);

    this.fireDBService.registerUser(pd);
  }

  public updateProfileData(pd: any) {
    this.profileData = Object.assign({}, pd);
  }

  public imgSrc(format, base64data) {
    return this.sanitizer.bypassSecurityTrustUrl('data:'+format+';base64,' + base64data);
  }

  public rawImgSrc(format, base64data) : string {
    return ('data:'+format+';base64,' + base64data);
  }

  public sanitizeImg(imgData) {
    return this.sanitizer.bypassSecurityTrustUrl(imgData);
  }
}
