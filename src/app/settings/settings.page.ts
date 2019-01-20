import { Component, OnInit, Output } from '@angular/core';

import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  providers: [SocialSharing]
})
export class SettingsPage implements OnInit {

  constructor(private socialShare: SocialSharing) { }

  ngOnInit() {
  }

  @Output() closePopover(){
    
  }

  onShare() {
    const message = "Hey, I am enjoying *MGooS Social Music Sharing* App. Install it, you will love it.";
    const subject = "MGoos Social Music Sharing App";
    const file    = "";
    const url     = "https://play.google.com/store/apps/details?id=com.mgoos.app&hl=en";

    this.socialShare.share(message, subject, file, url).then(() => {
      //alert("done sharing");
      console.log("done sharing");
    }).catch(error => {
      console.log(error);
    });
  }
}
