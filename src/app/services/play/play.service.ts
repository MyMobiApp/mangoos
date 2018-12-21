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
  
  constructor() {
    let _me_ = this; 
    this.playlistObservable = Observable.create(observer => {
      _me_.playlistObserver = observer;
    });

    this.playItemObservable = Observable.create(observer => {
      _me_.playItemObserver = observer;
    });

    // Dummy calls, to initialize respective observers
    this.playlistObservable.subscribe(data => {});
    this.playItemObservable.subscribe(data => {});
  }

  getCurrentMP3() {
    return this.playlist[this.playIndex].mp3Data.fullPath;
  }

  incrementMP3Pointer() {
    let playlistSize = this.playlist.length;

    if((playlistSize -1) == this.playIndex) {
      this.playIndex = 0; // Reached end, loop it
    } else {
      this.playIndex++; // Increment it
    }
  }

  setCurrentMP3(index: number, bPlay: boolean) {
    this.playIndex = index;

    if(bPlay) {
      this.playItemObserver.next(true);
    }
  }

  enqueue(id: string, mp3Data: FileMetaInfo) {
    this.playlist.push({'id': id, 'mp3Data': mp3Data});
    
    this.playlistObserver.next(true);
    alert(JSON.stringify(this.playlist));
  }

  dequeue(id: string) {
    this.playlist.splice(this.playlist.findIndex( element => {
      return element.id === id;
    }), 1);

    this.playlistObserver.next(true);
  }

  moveTo(indexes) {
    /*let element = this.playlist[indexes.from];
    this.playlist.splice(indexes.from, 1);
    this.playlist.splice(indexes.to, 0, element);*/
    this.playlist.splice(indexes.detail.to, 0, this.playlist.splice(indexes.detail.from, 1)[0]);
  }

  moveToID(id: string, toIndex: number) {
    let fromIndex = this.playlist.findIndex( element => {
      return element.id === id;
    });

    this.playlist.splice(toIndex, 0, this.playlist.splice(fromIndex, 1)[0]);
  }
}
