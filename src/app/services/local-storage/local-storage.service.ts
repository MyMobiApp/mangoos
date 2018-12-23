import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx'

export interface IUserProfile {

}

export interface IPlaylist {

}

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(private objNativeStorage: NativeStorage) { 

  }
}
