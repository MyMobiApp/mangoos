import { Component, NgZone, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Platform, IonRouterOutlet, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { DataService } from './services/data/data.service';
import { FirebaseDBService } from './services/firebase-db/firebase-db.service';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { Facebook } from '@ionic-native/facebook/ngx';
import { DBMaintenanceService } from './services/db-maintenance-service/dbmaintenance.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  providers: [Facebook]
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

  @ViewChild(IonRouterOutlet) routerOutlet: IonRouterOutlet;

  constructor(
    private zone: NgZone,
    //private objFB: Facebook,
    private objRouter: Router,
    private alertCtrl: AlertController,
    private objAFAuth: AngularFireAuth,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private objDataService: DataService,
    private objFirebaseDBService: FirebaseDBService,
    private objDBMaintain: DBMaintenanceService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    var _me_ = this;

    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();

      this.objAFAuth.auth.onAuthStateChanged(user => {
        if (user) {
          console.log("User Info:")
          console.log(user);

          _me_.objFirebaseDBService.getUserProfile(user.email).then(data => {
            _me_.objDataService.setProfileData(data);
            
            _me_.zone.run(() => {
              _me_.objRouter.navigateByUrl('/tabs'); //to the page where user navigates after login
            });
            
            //alert("Hiding splash screen");
            this.splashScreen.hide();
          });
          // User is signed in.
        } else {
          _me_.zone.run(() => {
            _me_.objRouter.navigateByUrl('/Login'); // to the login page as user is not logged in
          });
          this.splashScreen.hide();
          // No user is signed in.
        }
      });
      
    });

    this.platform.backButton.subscribe(async () => {
      if (this.routerOutlet && this.routerOutlet.canGoBack()) {
        this.routerOutlet.pop();
      } else if (this.objRouter.url === '') {
        navigator['app'].exitApp();
      } else {
        //this.generic.showAlert("Exit", "Do you want to exit the app?", this.onYesHandler, this.onNoHandler, "backPress");
        let alert = await this.alertCtrl.create({
          header: 'Confirm Exit',
          message: 'Do you want to exit the app?',
          buttons: [
            {
              text: 'No',
              role: 'cancel',
              handler: () => {
                _me_.objRouter.navigateByUrl('/tabs');
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Yes',
              handler: () => {
                navigator['app'].exitApp();
              }
            }
          ]
        });
        await alert.present();
      }      
    }, error => {
      alert("backButton Error: " + error);
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
