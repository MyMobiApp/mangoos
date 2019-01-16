import { Component, OnInit, Input } from '@angular/core';
import { FeedItem, FirebaseDBService, FileMetaInfo } from 'src/app/services/firebase-db/firebase-db.service';
import { PlayService } from 'src/app/services/play/play.service';
import { ProfileService } from 'src/app/services/profile-service/profile-service.service';
import { DataService } from 'src/app/services/data/data.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-feed-audio-item',
  templateUrl: './feed-audio-item.component.html',
  styleUrls: ['./feed-audio-item.component.scss']
})
export class FeedAudioItemComponent implements OnInit {
  @Input() feedItem: FeedItem;
  feed_profile_img_url: string;

  music_album: string = "";
  music_title: string = "";
  music_thumbnail: string = null;
  music_metadata: FileMetaInfo;

  constructor(private toastCtrl: ToastController,
              private profileService: ProfileService,
              private playService: PlayService,
              private dataService: DataService,
              private firebaseDBService: FirebaseDBService) { }

  ngOnInit() {
    let date = new Date(this.feedItem.post_datetime);
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
    this.feedItem.post_datetime = date.toLocaleString("en-US", options);

    this.loadProfileImgURL();
    this.loadMusicMetadata();
  }

  loadProfileImgURL() {
    this.profileService.getProfileImage(this.feedItem.profile_handle).then(imr_url => {
      this.feed_profile_img_url = imr_url;
    }).catch(error => {
      console.log(error);
    });
  }

  loadMusicMetadata() {
    let _me_ = this;
    this.firebaseDBService.getMusicMetadata(this.feedItem.db_path)
        .then(data => {
          let thumbnail = null;

          if(data.metaData.common.hasOwnProperty('picture') && data.metaData.common.picture[0].hasOwnProperty('data')) {
            let imgBlob = <firebase.firestore.Blob>data.metaData.common.picture[0].data;

            thumbnail = _me_.dataService.imgSrc(data.metaData.common.picture[0].format, imgBlob.toBase64());
          }
          
          _me_.music_album = data.metaData.hasOwnProperty('common') ? data.metaData.common.album : data.albumName;
          _me_.music_title = data.metaData.hasOwnProperty('common') ? data.metaData.common.title : data.customName;
          _me_.music_thumbnail = thumbnail;
          _me_.music_metadata = data;
        }).catch(error => {
          console.log(error);
        });
  }

  async onAddToPlaylist() {
    this.playService.enqueue(this.feedItem.doc_id, this.music_thumbnail, this.music_metadata);

    let title = this.music_metadata.hasOwnProperty('metaData') ? this.music_metadata.metaData.common.title : this.music_metadata.customName;

    let toast = await this.toastCtrl.create({
      message: title + ' added to the playlist.',
      position: 'top',
      duration: 3000
    });
    toast.present();
  }

}
