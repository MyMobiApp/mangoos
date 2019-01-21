import { Component, OnInit } from '@angular/core';
import { NavParams, AlertController, ToastController, PopoverController } from '@ionic/angular';

import { FirebaseDBService } from '../services/firebase-db/firebase-db.service';
import { DataService } from '../services/data/data.service';
import { MyMusicPage } from '../my-music/my-music.page';

@Component({
  selector: 'app-mp3-settings',
  templateUrl: './mp3-settings.page.html',
  styleUrls: ['./mp3-settings.page.scss'],
})
export class MP3SettingsPage implements OnInit {
  metaInfo: any;
  popoverCtrl: PopoverController;

  constructor(private navParams: NavParams, 
              private dataService: DataService,
              private firebaseDBService: FirebaseDBService,
              private alertCtrl: AlertController,
              private toastCtrl: ToastController,) { 
    this.metaInfo     = this.navParams.get('metaInfo');
    this.popoverCtrl  = this.navParams.get('popoverObj');

    console.log(this.metaInfo);
  }

  ngOnInit() {
  }

  async editMusicFile() {
    let _me_ = this;

    let bMetaData = this.metaInfo.mp3Data.hasOwnProperty('metaData');
    const album = bMetaData ? this.metaInfo.mp3Data.metaData.common.album : this.metaInfo.mp3Data.albumName;
    const title = bMetaData ? this.metaInfo.mp3Data.metaData.common.title : this.metaInfo.mp3Data.customName;
    const doc_path = `mp3Collection/${this.dataService.getProfileData().handle}/default/${this.metaInfo.id}`;

    //alert(album + " - " + title);

    let dialog = await this.alertCtrl.create({
      header: 'Update Info',
      message: 'Provide album and title',
      inputs: [
        {
          name: 'var_album',
          placeholder: 'Album name',
          value: album
        },
        {
          name: 'var_title',
          placeholder: 'Title',
          value: title
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            _me_.popoverCtrl.dismiss(false);

            console.log('Cancel clicked');
          }
        },
        {
          text: 'Update',
          handler: data => {
            console.log(data);

            this.firebaseDBService.editMusicMetadata(doc_path, data.var_album, data.var_title)
            .then(async () => {
              let toast = await this.toastCtrl.create({
                message: 'Info updated successfully.',
                position: 'top',
                duration: 3000
              });
              toast.present();
            }).catch(error => {
              console.log(error);
            }).finally(() => {
              _me_.popoverCtrl.dismiss(true);
            });
          }
        }
      ]
    });
    await dialog.present();
  }

  async deleteMusicFile() {
    let _me_ = this;

    let alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: 'Do you want to delete this file?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            _me_.popoverCtrl.dismiss(false);

            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            const file_path = this.metaInfo.mp3Data.fullPath; 
            const doc_path = `mp3Collection/${this.dataService.getProfileData().handle}/default/${this.metaInfo.id}`;

            this.firebaseDBService.deleteMusicMetadataAndFile(doc_path, file_path)
            .then(async () => {
              let toast = await this.toastCtrl.create({
                message: 'File deleted successfully.',
                position: 'top',
                duration: 3000
              });
              toast.present();
            }).catch(error => {
              console.log(error);
            }).finally(() => {
              _me_.popoverCtrl.dismiss(true);
            });
          }
        }
      ]
    });
    await alert.present();
  }

}
