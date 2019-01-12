import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mp3-settings',
  templateUrl: './mp3-settings.page.html',
  styleUrls: ['./mp3-settings.page.scss'],
})
export class MP3SettingsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  editMusicFile() {
    alert("editMusicFile");
  }

  deleteMusicFile() {
    alert("deleteMusicFile");
  }

}
