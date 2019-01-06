import { Component, OnInit, Input, NgZone, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { Media, MediaObject, MEDIA_STATUS } from '@ionic-native/media/ngx';
import { PlayService } from 'src/app/services/play/play.service';
import { FirebaseStorageService } from 'src/app/services/firebase-storage/firebase-storage.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

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
  private bPlaying: boolean = false;
  private nDuration:  number = 0;
  private timerToken: any;
  private playPos: number = 0;
  private nTimeSpent: number;
  private sTimeSpent: string = "00:00";
  private bUserStopped: boolean = false;
  
  private mp3File: MediaObject = null;

  constructor(private media: Media,
              private objRouter: Router,
              private playService: PlayService,
              private alertCtrl: AlertController,
              private objFirebaseStorageService: FirebaseStorageService) {
    
  }

  ngOnInit() {
    
  }

  async alertOnEmptyPlaylist() {
    let _me_ = this;

    let alert = await this.alertCtrl.create({
      header: 'Playlist is empty',
      message: 'Please add mp3 to playlist.',
      buttons: [{
        text: 'OK',
        role: 'ok',
        handler: () => {
          _me_.objRouter.navigateByUrl('/tabs/(my-music:my-music)');
        }
      }]
    });
    
    await alert.present();
  }

  playViaParent() {
    this.bUserStopped = true;

    if(this.bPlaying && this.mp3File) {
      this.mp3File.stop();
      this.mp3File = null;
      this.bPlaying = false;
    }

    this.bPlaying = true;

    this.onPlay();
  }

  setPlayPosViaParent(playPos: number) {
    this.playPos = playPos;
  }

  stopViaParent() {
    this.bUserStopped = true;
    
    if(this.bPlaying && this.mp3File) {
      this.mp3File.stop();
      this.mp3File = null;
      this.bPlaying = false;
    }
  }

  onPlay() {
    let _me_ = this;

    if(this.playService.getPlaylistLength() < 1) {
      this.alertOnEmptyPlaylist();
      return;
    }

    let newPlayPos = this.playService.getCurrentPlayIndex();
    let fullPath = this.playService.getCurrentMP3();
    
    console.log("Old Play Pos: " + this.playPos + ", New Play Pos: " + newPlayPos + ", Full Path: " + fullPath);
    if(this.playPos == newPlayPos && _me_.mediaStatus == MEDIA_STATUS.PAUSED) {
      _me_.mp3File.play();
    }
    else {
      if(_me_.mp3File && _me_.mediaStatus != MEDIA_STATUS.STOPPED) {
        //console.log("Stopping : " + _me_.playPos);
        _me_.mp3File.stop();
        _me_.mp3File = null;
      }

      this.objFirebaseStorageService.getMP3DownloadURL(fullPath).then(mp3URL => {
        _me_.mp3File = _me_.media.create(mp3URL);

        // Virtual duration now capped to 600 sec or 10 mins
        _me_.nDuration = _me_.mp3File.getDuration() == -1 ? 600 : _me_.mp3File.getDuration();
    
        // to listen to plugin events:
        _me_.subscribeToPlayEvents(_me_.mp3File);
        
        // Play MP3 file
        _me_.bUserStopped = false;
        _me_.playPos = newPlayPos;
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
    this.mp3File = null;
  }

  seetTo(index: number) {
    let position = (this.nDuration * index) / 100;
    
    this.mp3File.seekTo(position);
  }

  async subscribeToPlayEvents(mp3File) {
    let _me_ = this;

    await mp3File.onStatusUpdate.subscribe(status => {
      _me_.mediaStatus = status;
      
      switch(status) {
        case MEDIA_STATUS.STARTING: {
          _me_.trackPlayProgress(_me_.mp3File);
          
          break;
        }
        case MEDIA_STATUS.PAUSED: {
          break;
        }
        case MEDIA_STATUS.STOPPED: {
          //console.log("In onStatusUpdate Stopped, play pos: " + _me_.playPos);
          clearInterval(_me_.timerToken);
          
          if(!_me_.bUserStopped) {
            _me_.playService.incrementMP3Pointer();
            _me_.onPlay();
          }

          break;
        }
      }
      
      console.log(status);
    }); // fires when file status changes

    // This gets called when play finished playing MP3, Load next MP3 in playlist here.
    _me_.mp3File.onSuccess.subscribe(() => {
      //console.log("In onSuccess, play pos: " + _me_.playPos);
      
      //console.log('MP3 finished playing');
    });

    _me_.mp3File.onError.subscribe(error => {
      alert("onError Subscribe: " + JSON.stringify(error));
      console.log('Error!', error);
    });
  }
  
  trackPlayProgress(mp3File) {
    let _me_ = this;

    // Check current play position
    this.timerToken = setInterval(() => {
      mp3File.getCurrentPosition().then(value => {
        var date = new Date(null);

        let timeSpent: number = Math.round(value);
        
        _me_.nTimeSpent = timeSpent;

        //console.log("Status : " + _me_.mediaStatus);
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
    //console.log(event);
    //console.log(this.nTimeSpent + " < Old - New > " + event.detail.value);
    if(Math.abs(event.detail.value - this.nTimeSpent) > 1) {
      this.mp3File.seekTo(event.detail.value * 1000);
    }
  }

  onTimerClicked() {
    this.bTimerToggle = this.bTimerToggle ? false : true;
  }
}
