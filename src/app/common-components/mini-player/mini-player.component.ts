import { Component, OnInit, Input, NgZone } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

import { PlayService } from 'src/app/services/play/play.service';
import { FirebaseStorageService } from 'src/app/services/firebase-storage/firebase-storage.service';

import { Media, MediaObject, MEDIA_STATUS } from '@ionic-native/media/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { FileMetaInfo } from 'src/app/services/firebase-db/firebase-db.service';
import { DataService } from 'src/app/services/data/data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-mini-player',
  templateUrl: './mini-player.component.html',
  styleUrls: ['./mini-player.component.scss'],
  providers: [Media, BackgroundMode, LocalNotifications]
})
export class MiniPlayerComponent implements OnInit {

  @Input() sColor: string = "light";

  private playLocalNotificationID = 99999;

  public mediaStatus: MEDIA_STATUS = MEDIA_STATUS.NONE;
  public nDuration:  number = 0;
  public nTimeSpent: number;
  public sTimeSpent: string = "00:00";
  
  private bTimerToggle: boolean = false;
  private bPlaying: boolean = false;
  private timerToken: any;
  private playPos: number = 0;
  private bUserStopped: boolean = false;
  
  //private mp3File: MediaObject = null;
  private mp3File: any = null;

  constructor(private dataService: DataService,
              private playService: PlayService,
              private media: Media,
              private objRouter: Router,
              private alertCtrl: AlertController,
              private localNotification: LocalNotifications,
              private zone: NgZone, 
              //private changeDetector: ChangeDetectorRef,
              private backgroundMode: BackgroundMode,
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
    //alert("stopViaParent : " + this.bPlaying);
    
    if(this.bPlaying && this.mp3File) {
      this.onStop()
    }
  }

  async onPlay() {
    let _me_ = this;

    if(this.playService.getPlaylistLength() < 1) {
      this.alertOnEmptyPlaylist();
      return;
    }

    let newPlayPos = this.playService.getCurrentPlayIndex();
    let fullPath = this.playService.getCurrentMP3();
    
    //console.log("Old Play Pos: " + this.playPos + ", New Play Pos: " + newPlayPos + ", Full Path: " + fullPath);
    if(this.playPos == newPlayPos && _me_.mediaStatus == MEDIA_STATUS.PAUSED) {
      _me_.mp3File.play();
    }
    else {
      if(_me_.mp3File && _me_.mediaStatus != MEDIA_STATUS.STOPPED) {
        //console.log("Stopping : " + _me_.playPos);
        _me_.mp3File.stop();
      }

      if(_me_.mp3File == null) {
        _me_.mp3File = true;

        await this.objFirebaseStorageService.getMP3DownloadURL(fullPath)
          .then(mp3URL => {
            _me_.mp3File = _me_.media.create(mp3URL);

            // Virtual duration now capped to 600 sec or 10 mins
            _me_.nDuration = _me_.playService.getCurrentDuration();
        
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
  }

  onPause() {
    this.mp3File.pause();
  }

  onStop() {
    // Disable background mode
    this.backgroundMode.disable();
    // Clear notification
    this.localNotification.cancel(this.playLocalNotificationID);

    // Stop it now
    this.bUserStopped = true;
    this.bPlaying = false;
    this.mp3File.stop();
    this.mp3File = null;
    this.nTimeSpent = 0;
    this.sTimeSpent = "00:00";
  }

  seetTo(index: number) {
    let position = (this.nDuration * index) / 100;
    
    this.mp3File.seekTo(position);
  }

  async subscribeToPlayEvents(mp3File) {
    let _me_ = this;

    window.addEventListener('beforeunload', () => {
      _me_.localNotification.cancel(_me_.playLocalNotificationID);
    });

    await mp3File.onStatusUpdate.subscribe(status => {
      _me_.mediaStatus = status;
      
      switch(status) {
        case MEDIA_STATUS.STARTING: {
          _me_.trackPlayProgress(_me_.mp3File);
          
          break;
        }
        case MEDIA_STATUS.RUNNING: {
          _me_.bPlaying = true;
          // Enable background mode
          _me_.backgroundMode.enable();

          let mp3Data: FileMetaInfo = _me_.playService.getCurrentMP3Data();
          let thumbnail = null;

          if( mp3Data.hasOwnProperty('metaData') && 
              mp3Data.metaData.common.hasOwnProperty('picture') && 
              mp3Data.metaData.common.picture[0].hasOwnProperty('data')) {
            let imgBlob = <firebase.firestore.Blob>mp3Data.metaData.common.picture[0].data;

            thumbnail = _me_.dataService.imgSrc(mp3Data.metaData.common.picture[0].format, imgBlob.toBase64());
          }

          _me_.localNotification.cancel(_me_.playLocalNotificationID);
          _me_.localNotification.schedule({
            id: _me_.playLocalNotificationID,
            title: (mp3Data.hasOwnProperty('metaData') && mp3Data.metaData.common.title) ? mp3Data.metaData.common.title : mp3Data.customName,
            text: `Playing music from album '${(mp3Data.hasOwnProperty('metaData') && mp3Data.metaData.common.album) ? mp3Data.metaData.common.album : mp3Data.albumName}'`,
            sticky: true,
            sound: null
          });
        }
        case MEDIA_STATUS.PAUSED: {
          break;
        }
        case MEDIA_STATUS.STOPPED: {
          _me_.bPlaying = false;
          // Clear play notification.
          _me_.localNotification.cancel(_me_.playLocalNotificationID);

          // Clear mp3File object
          _me_.mp3File = null;

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
        
        _me_.zone.run(() => {
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
        });

        //_me_.changeDetector.detectChanges();
      }).catch(error => {
        //alert("getCurrentPosition: " + JSON.stringify(error));
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
