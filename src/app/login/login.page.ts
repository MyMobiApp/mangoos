import { Component, OnInit } from '@angular/core';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';

import { DataService } from '../services/data/data.service';
import { FirebaseDBService } from '../services/firebase-db/firebase-db.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  providers: [Facebook, DataService, FirebaseDBService]
})
export class LoginPage implements OnInit {
  objDataService: DataService;
  objFirebaseDBService: FirebaseDBService;
  
  constructor(private fb: Facebook) { }

  ngOnInit() {
  }

  onLogin() {
    this.fb.login(['public_profile', 'user_friends', 'email'])
        .then((res: FacebookLoginResponse) => {
          this.fb.api('me?fields=id,name,email,first_name,picture.width(720).height(720).as(picture_large)', [])
            .then(profile => {
              var userData = {
                email: profile['email'], 
                first_name: profile['first_name'], 
                picture: profile['picture_large']['data']['url'], 
                username: profile['name']
              };

              this.objDataService.setProfileData(userData);
              console.log('Logged into Facebook!', userData);
            })
        })
        .catch(e => console.log('Error logging into Facebook', e));
    
    //this.fb.logEvent(this.fb.EVENTS.EVENT_NAME_ACTIVATED_APP);
  }
}
