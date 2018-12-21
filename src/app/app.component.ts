import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { DataService } from './services/data/data.service';
import { FirebaseDBService } from './services/firebase-db/firebase-db.service';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  // Tutorial: https://youtu.be/srTt7AVof-U
  public appMenuPages = [
    {
      title: "Home", 
      route: "/tabs", 
      icon: "logo-rss",
      callBack: null 
    },
    {
      title: "My Profile", 
      route: "/MyProfile", 
      icon: "person",
      callBack: null
    },
    {
      title: "Sign Out", 
      route: "", 
      icon: "log-out",
      callBack: this.onSignOut 
    }
  ];
  constructor(
    private objRouter: Router,
    private objAFAuth: AngularFireAuth,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private objDataService: DataService,
    private objFirebaseDBService: FirebaseDBService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    var _me_ = this;

    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.objAFAuth.auth.onAuthStateChanged(user => {
        if (user) {
          console.log("User: " + JSON.stringify(user));

          _me_.objFirebaseDBService.getUserProfile(user.email).then(data => {
            _me_.objDataService.saveProfileData(data);
            _me_.objRouter.navigateByUrl('/tabs'); //to the page where user navigates after login
            //alert("Hiding splash screen");
            this.splashScreen.hide();
          });
          // User is signed in.
        } else {
          this.splashScreen.hide();
          _me_.objRouter.navigateByUrl(''); // to the login page as user is not logged in
          // No user is signed in.
        }
      });
    });
  }

  onMenuItemClick(route: string, callBack: any) {
    if(callBack) {
      callBack();
    }

    this.objRouter.navigateByUrl(route);
  }

  onSignOut() {
    firebase.auth().signOut();
  }
}
