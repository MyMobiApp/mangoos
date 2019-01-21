import { Injectable } from '@angular/core';
import { FileMetaInfo } from '../firebase-db/firebase-db.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlayService {
  private playIndex: number = 0;
  playlist = Array();

  public  playlistObservable: Observable<number>;
  private playlistObserver: any;

  public  playItemObservable: Observable<number>;
  private playItemObserver: any;

  public  playStopObservable: Observable<number>;
  private playStopObserver: any;
  
  constructor() {
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

  enqueue(id: string, img: any, mp3Data: any) {
    this.playlist.push({'id': id, 'thumbnail': img, 'mp3Data': mp3Data});
    
    this.playlistObserver.next(true);
  }

  dequeue(id: string) {
    let idToMove = this.playlist[this.playIndex].id;

    this.playlist.splice(this.playlist.findIndex( element => {
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
