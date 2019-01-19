import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';

import { DataService } from '../services/data/data.service';
import { FirebaseDBService } from '../services/firebase-db/firebase-db.service';
import * as firebase from 'firebase';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  providers: [Facebook]
})
export class LoginPage implements OnInit {
  
  constructor(private objDataService: DataService,
              private objFirebaseDBService: FirebaseDBService,
              private objFB: Facebook, 
              private objRouter: Router,
              ) { 

              }

  ngOnInit() {
    /*var _me_ = this;

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        _me_.objRouter.navigateByUrl('/tabs'); //to the page where user navigates after login
        // User is signed in.
      } else {
        _me_.objRouter.navigateByUrl(''); // to the login page as user is not logged in
        // No user is signed in.
      }
    });*/
  }

  onLogin() {
    var _me_ = this;

    this.objFB.login(['public_profile', 'email'])
        .then((res: FacebookLoginResponse) => {
          this.objFB.api('me?fields=id,name,email,first_name,last_name,picture.width(720).height(720).as(picture_large)', [])
            .then(profile => {
              var userData = {
                email: profile['email'], 
                first_name: profile['first_name'], 
                last_name: profile['last_name'],
                picture_url: profile['picture_large']['data']['url'], 
                full_name: profile['name']
              };
              const facebookCredential = firebase.auth.FacebookAuthProvider
              .credential(res.authResponse.accessToken);

              firebase.auth().signInAndRetrieveDataWithCredential(facebookCredential)
              .then( success => { 
                console.log("Firebase success: " + JSON.stringify(success)); 
              });

              _me_.objDataService.saveProfileData(userData);
              console.log('Logged into Facebook!', userData);
              _me_.objRouter.navigateByUrl('/tabs');
            })
        })
        .catch(e => console.log('Error logging into Facebook', e));
    
    //this.fb.logEvent(this.fb.EVENTS.EVENT_NAME_ACTIVATED_APP);
  }
}
