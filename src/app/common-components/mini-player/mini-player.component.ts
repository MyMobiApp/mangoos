import { Component, OnInit, Input } from '@angular/core';
import { Media, MediaObject, MEDIA_STATUS } from '@ionic-native/media/ngx';
import { PlayService } from 'src/app/services/play/play.service';
import { FirebaseStorageService } from 'src/app/services/firebase-storage/firebase-storage.service';

@Component({
  selector: 'app-mini-player',
  templateUrl: './mini-player.component.html',
  styleUrls: ['./mini-player.component.scss'],
  providers: [Media]
})
export class MiniPlayerComponent implements OnInit {

  @Input() sColor: string = "dark";

  private mediaStatus: MEDIA_STATUS = MEDIA_STATUS.NONE;
  private nDuration:  number = 0;
  private timerToken : any;
  
  private mp3File: MediaObject;

  constructor(private media: Media, 
              private playService: PlayService,
              private objFirebaseStorageService: FirebaseStorageService) { }

  ngOnInit() {
    let _me_ = this;

    this.playService.playItemObservable.subscribe(data => {
      _me_.onPlay();
    });
  }

  onPlay() {
    let _me_ = this;

    let fullPath = this.playService.getCurrentMP3();
    this.objFirebaseStorageService.getMP3DownloadURL(fullPath).then(mp3URL => {
      if(_me_.mediaStatus == MEDIA_STATUS.RUNNING || _me_.mediaStatus == MEDIA_STATUS.PAUSED) {
        _me_.mp3File.stop();
      }
      _me_.mp3File = _me_.media.create(mp3URL);
      _me_.nDuration = _me_.mp3File.getDuration();
  
      // to listen to plugin events:
      _me_.mp3File.onStatusUpdate.subscribe(status => {
        _me_.mediaStatus = status;
        
        switch(status) {
          case MEDIA_STATUS.RUNNING: {
            _me_.trackPlayProgress();
          };
          case MEDIA_STATUS.PAUSED: {

          };
          case MEDIA_STATUS.STOPPED: {
            clearInterval(_me_.timerToken);
          }
      }
        console.log(status)
      }); // fires when file status changes
  
      // This gets called when play finished playing MP3, Load next MP3 in playlist here.
      _me_.mp3File.onSuccess.subscribe(() => {
        _me_.playService.incrementMP3Pointer();
        _me_.onPlay();
        console.log('MP3 finished playing');
      });
  
      _me_.mp3File.onError.subscribe(error => {
        alert(JSON.stringify(error));
        console.log('Error!', error);
      });

      // Play MP3 file
      _me_.mp3File.play();

    }).catch(err => {
      console.log(err);
    });
  }

  onPause() {
    this.mp3File.pause();
  }

  onStop() {
    this.mp3File.stop();
  }

  seetTo(index: number) {
    let position = (this.nDuration * index) / 100;
    
    this.mp3File.seekTo(position);
  }

  trackPlayProgress() {
    let _me_ = this;

    // Check current play position
    this.timerToken = setInterval(() => {
      _me_.mp3File.getCurrentPosition().then(value => {
        alert("Cur Pos:" + value);
      }).catch(error => {
        alert(JSON.stringify(error));
        console.log('Error!', error);
      });
    }, 1000);
  }
}
