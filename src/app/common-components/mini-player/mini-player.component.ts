import { Component, OnInit, Input, NgZone } from '@angular/core';
import { Media, MediaObject, MEDIA_STATUS } from '@ionic-native/media/ngx';
import { PlayService } from 'src/app/services/play/play.service';
import { FirebaseStorageService } from 'src/app/services/firebase-storage/firebase-storage.service';
import { Range } from '@ionic/angular';
import { RangeValue } from '@ionic/core';

@Component({
  selector: 'app-mini-player',
  templateUrl: './mini-player.component.html',
  styleUrls: ['./mini-player.component.scss'],
  providers: [Media]
})
export class MiniPlayerComponent implements OnInit {

  @Input() sColor: string = "light";

  private mediaStatus: MEDIA_STATUS = MEDIA_STATUS.NONE;
  private bTimerToggle: boolean = false;
  private nDuration:  number = 0;
  private timerToken: any;
  private playPos: number = 0;
  private nTimeSpent: Number;
  private sTimeSpent: string = "00:00";
  private bUserStopped: boolean = false;
  
  private mp3File: MediaObject;

  constructor(private media: Media,
              private zone: NgZone, 
              private playService: PlayService,
              private objFirebaseStorageService: FirebaseStorageService) { }

  ngOnInit() {
    let _me_ = this;

    this.playService.playItemObservable.subscribe(data => {
      //_me_.onPlay();
    });

    this.playService.playlistObservable.subscribe(data => {
      _me_.playPos = this.playService.getCurrentPlayIndex();
    });
  }

  onPlay() {
    let _me_ = this;

    let newPlayPos = this.playService.getCurrentPlayIndex();
    let fullPath = this.playService.getCurrentMP3();

    console.log("Old Play Pos: " + this.playPos + ", New Play Pos: " + newPlayPos + ", Full Path: " + fullPath);
    if(this.playPos == newPlayPos && _me_.mediaStatus == MEDIA_STATUS.PAUSED) {
      _me_.mp3File.play();
    }
    else {
      this.objFirebaseStorageService.getMP3DownloadURL(fullPath).then(mp3URL => {
        if(_me_.mediaStatus == MEDIA_STATUS.RUNNING || _me_.mediaStatus == MEDIA_STATUS.PAUSED) {
          _me_.mp3File.stop();
        }
        _me_.mp3File = _me_.media.create(mp3URL);

        // Virtual duration now capped to 600 sec or 10 mins
        _me_.nDuration = _me_.mp3File.getDuration() == -1 ? 600 : _me_.mp3File.getDuration();
    
        // *********************************************************
        // to listen to plugin events:
        // *********************************************************
        _me_.mp3File.onStatusUpdate.subscribe(status => {
          _me_.mediaStatus = status;
          
          switch(status) {
            case MEDIA_STATUS.STARTING: {
              _me_.trackPlayProgress();
              
              break;
            }
            case MEDIA_STATUS.PAUSED: {
              break;
            }
            case MEDIA_STATUS.STOPPED: {
              clearInterval(_me_.timerToken);

              break;
            }
          }
          console.log(status)
        }); // fires when file status changes
    
        // This gets called when play finished playing MP3, Load next MP3 in playlist here.
        _me_.mp3File.onSuccess.subscribe(() => {
          if(!_me_.bUserStopped) {
            _me_.playService.incrementMP3Pointer();
            _me_.onPlay();
          }
          console.log('MP3 finished playing');
        });
    
        _me_.mp3File.onError.subscribe(error => {
          alert("onError Subscribe: " + JSON.stringify(error));
          console.log('Error!', error);
        });
        // *********************************************************
        // [End listening to events]
        // *********************************************************

        // Play MP3 file
        _me_.bUserStopped = false;
        _me_.mp3File.play();
        _me_.playService.triggerPlaylistObserver();

      }).catch(err => {
        console.log(err);
      });
    }
  }

  onPause() {
    this.mp3File.pause();
  }

  onStop() {
    this.bUserStopped = true;
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
        var date = new Date(null);

        let timeSpent: number = Math.round(value);
        _me_.nTimeSpent = timeSpent;

        //console.log("Duration : " + _me_.nDuration);
        if(_me_.bTimerToggle) {
          date.setSeconds(_me_.nDuration - timeSpent);
        }
        else {
          date.setSeconds(timeSpent);
        }
        
        if(_me_.nDuration < 3600) {
          _me_.sTimeSpent = (this.bTimerToggle? '—' : '') + date.toISOString().substr(14, 5);
        }
        else {
          _me_.sTimeSpent = (this.bTimerToggle? '—' : '') + date.toISOString().substr(11, 8);
        }
      }).catch(error => {
        alert("getCurrentPosition: " + JSON.stringify(error));
        console.log('Error!', error);
      });
    }, 1000);
  }

  onPlayProgressChange(event) {
    this.zone.run(() => {
      //console.log('UI has refreshed');
    });
  }

  onTimerClicked() {
    this.bTimerToggle = this.bTimerToggle ? false : true;
  }
}
