import { Component, OnInit } from '@angular/core';

import { DataService } from '../services/data/data.service';
import { IUserProfile } from '../services/firebase-db/firebase-db.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.page.html',
  styleUrls: ['./my-profile.page.scss']
})
export class MyProfilePage implements OnInit {
  public objUserProfile: IUserProfile;

  constructor(private objDataService: DataService) { }

  ngOnInit() {
    this.objUserProfile = this.objDataService.getProfileData();
  }

}
