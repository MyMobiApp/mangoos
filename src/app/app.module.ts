import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { SettingsPageModule } from './settings/settings.module';
import { CommonComponentsModule } from './common-components/common-components.module';

import * as firebase from 'firebase';

var config = {
  apiKey: "AIzaSyAfYQfWlpMx3H6aOZ6pkEnWEM4QK00-Bvs",
  authDomain: "mgoos-mvp.firebaseapp.com",
  databaseURL: "https://mgoos-mvp.firebaseio.com",
  projectId: "mgoos-mvp",
  storageBucket: "mgoos-mvp.appspot.com",
  messagingSenderId: "949519506589"
};
firebase.initializeApp(config);

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule, 
    SettingsPageModule,
    CommonComponentsModule 
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
