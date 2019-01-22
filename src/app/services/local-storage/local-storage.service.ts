import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { SafeUrl } from '@angular/platform-browser';

import { IUserProfile, IFeedItem } from '../firebase-db/firebase-db.service';

export interface IPlaylist {
  id:         string;
  album:      string;
  title:      string;
  thumbnail:  SafeUrl;
  metaInfo:   any;
}

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(private objNativeStorage: NativeStorage) { 
    
  }

  persistPlaylist(playlistAry: IPlaylist[]) : Promise<any> {
    return this.objNativeStorage.setItem('playlist', playlistAry);
  }

  getPlaylist() : Promise<IPlaylist[]> {
    return this.objNativeStorage.getItem('playlist');
  }

  persistUserProfile(userProfile: IUserProfile) : Promise<any>  {
    return this.objNativeStorage.setItem('userProfile', userProfile);
  }

  getUserProfile() : Promise<IUserProfile> {
    return this.objNativeStorage.getItem('userProfile');
  }

  persistFeedItems(feedItemAry: IFeedItem[]) : Promise<any> {
    return this.objNativeStorage.setItem('feed', feedItemAry);
  }

  getFeedItem() : Promise<IFeedItem[]> {
    return this.objNativeStorage.getItem('feed');
  }
}
