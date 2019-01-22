import { Injectable } from '@angular/core';
import { FileMetaInfo } from '../firebase-db/firebase-db.service';
import { Observable } from 'rxjs';
import { IPlaylist, LocalStorageService } from '../local-storage/local-storage.service';
import { DataService } from '../data/data.service';

@Injectable({
  providedIn: 'root'
})
export class PlayService {
  private playIndex: number = 0;
  playlist = Array();
  normPlaylist = Array();

  public  playlistObservable: Observable<number>;
  private playlistObserver: any;

  public  playItemObservable: Observable<number>;
  private playItemObserver: any;

  public  playStopObservable: Observable<number>;
  private playStopObserver: any;
  
  constructor(private objLocalStorage: LocalStorageService,
              private objDataService: DataService) {
    let _me_ = this; 
    this.playlistObservable = Observable.create(observer => {
      _me_.playlistObserver = observer;
    });

    this.playItemObservable = Observable.create(observer => {
      _me_.playItemObserver = observer;
    });

    this.playStopObservable = Observable.create(observer => {
      _me_.playStopObserver = observer;
    });

    // Dummy calls, to initialize respective observers
    this.playlistObservable.subscribe(data => {});
    this.playItemObservable.subscribe(data => {});
    this.playStopObservable.subscribe(data => {});

    // Fetch meteInfo of playlist items from server
    this.objLocalStorage.getPlaylist().then(playlist => {
      console.log("Reading playlist from local storage");
      console.log(playlist);
      //alert(JSON.stringify(playlist));
      
      playlist.forEach(item => {
        let thumbnail = null;

        if(item.thumbnail) {
          thumbnail = _me_.objDataService.sanitizeImg(item.thumbnail);
        }
        
        _me_.enqueue(item.id, thumbnail, item.metaInfo, false);
      });
    }).catch(error => {
      //alert(error);
      console.log("Error getting playlist from native storage: " + error);
    });
  }

  getCurrentPlayIndex() {
    return this.playIndex;
  }

  getPlaylistLength() {
    return this.playlist.length;
  }

  getCurrentMP3() {
    return this.playlist[this.playIndex].mp3Data.fullPath;
  }

  getCurrentMP3Data() : FileMetaInfo {
    return this.playlist[this.playIndex].mp3Data;
  }

  getCurrentDuration() {
    let duration = 600; // Dummy duration, if duration is not available

    if(this.playlist[this.playIndex].mp3Data.hasOwnProperty('metaData')) {
      duration = this.playlist[this.playIndex].mp3Data.metaData.format.duration;
      duration = duration ? Math.round(duration) : 600;
    }

    return duration;
  }

  incrementMP3Pointer() {
    let playlistSize = this.playlist.length;

    if((playlistSize -1) == this.playIndex) {
      this.playIndex = 0; // Reached end, loop it
    } else {
      this.playIndex++; // Increment it
    }

    this.playlistObserver.next(true);
  }

  setCurrentMP3(index: number, bPlay: boolean) {
    this.playIndex = index;

    if(bPlay) {
      this.playItemObserver.next(true);
    }
  }

  enqueue(id: string, img: any, mp3Data: any, bStore: boolean) {
    this.playlist.push({'id': id, 'thumbnail': img, 'mp3Data': mp3Data});

    this.normPlaylist.push({
        id: id,
        album: mp3Data.hasOwnProperty('metaData') ? mp3Data.metaData.common.album : mp3Data.albumName, 
        title: mp3Data.hasOwnProperty('metaData') ? mp3Data.metaData.common.title : mp3Data.customName, 
        thumbnail: img,
        metaInfo: mp3Data
    });
    
    this.playlistObserver.next(true);

    if(bStore) {
      let list = this.normPlaylist.map(x => {
        if(x.thumbnail) {
          let imgBlob = <firebase.firestore.Blob>x.metaInfo.metaData.common.picture[0].data;
          x.thumbnail = this.objDataService.rawImgSrc(x.metaInfo.metaData.common.picture[0].format, imgBlob.toBase64());
        }
        return x;
      });
      this.objLocalStorage.persistPlaylist(list).then(val => {
        console.log("Wrote playlist to storage ");
        console.log(val);
        //alert(JSON.stringify(val));
      }).catch(error => {
        console.log("Error writing to native storage: " + error);
      });
    }
  }

  dequeue(id: string, bStore: boolean) {
    let idToMove = this.playlist[this.playIndex].id;

    this.playlist.splice(this.playlist.findIndex( element => {
      return element.id === id;
    }), 1);
    this.normPlaylist.splice(this.playlist.findIndex( element => {
      return element.id === id;
    }), 1);

    if(id != idToMove) {
      this.adjustPlayIndex(idToMove);
    }
    else {
      // Stop mp3 play
      this.playStopObserver.next(true);
    }

    this.playlistObserver.next(true);

    if(bStore) {
      let list = this.normPlaylist.map(x => {
        if(x.thumbnail) {
          let imgBlob = <firebase.firestore.Blob>x.metaInfo.metaData.common.picture[0].data;
          x.thumbnail = this.objDataService.rawImgSrc(x.metaInfo.metaData.common.picture[0].format, imgBlob.toBase64());
        }
        return x;
      });
      this.objLocalStorage.persistPlaylist(list).then(val => {
        console.log("Wrote playlist to storage ");
        console.log(val);
        //alert(JSON.stringify(val));
      }).catch(error => {
        console.log("Error writing to native storage: " + error);
      });;
    }
  }

  moveTo(indexes) {
    let idToMove = this.playlist[this.playIndex].id;

    this.playlist.splice(indexes.detail.to, 0, this.playlist.splice(indexes.detail.from, 1)[0]);

    this.adjustPlayIndex(idToMove);
  }

  moveToID(id: string, toIndex: number) {
    let fromIndex = this.playlist.findIndex( element => {
      return element.id === id;
    });

    this.playlist.splice(toIndex, 0, this.playlist.splice(fromIndex, 1)[0]);
    this.normPlaylist.splice(toIndex, 0, this.playlist.splice(fromIndex, 1)[0]);
  }

  adjustPlayIndex(playIndexID:string) {
    this.playIndex = this.playlist.findIndex( element => {
      return element.id === playIndexID;
    });

    this.playlistObserver.next(true);
  }

  triggerPlaylistObserver() {
    this.playlistObserver.next(true);
  }

  triggerPlayItemObserver() {
    this.playItemObserver.next(true);
  }
}
