import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  // https://youtu.be/srTt7AVof-U
  public appMenuPages = [
    {
      title: "Home", 
      route: "/tabs", 
      icon: "logo-rss" 
    },
    {
      title: "My Profile", 
      route: "/MyProfile", 
      icon: "person"
    },
    {
      title: "Sign Out", 
      route: "", 
      icon: "log-out"
    }
  ];
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
