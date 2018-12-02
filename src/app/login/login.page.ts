import { Component, OnInit } from '@angular/core';

import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  providers: [Facebook]
})
export class LoginPage implements OnInit {
  userData: any;
  
  constructor(private fb: Facebook) { }

  ngOnInit() {
  }

  onLogin() {
    this.fb.login(['public_profile', 'user_friends', 'email'])
        .then((res: FacebookLoginResponse) => {
          this.fb.api('me?fields=id,name,email,first_name,picture.width(720).height(720).as(picture_large)', [])
            .then(profile => {
              this.userData = {
                email: profile['email'], 
                first_name: profile['first_name'], 
                picture: profile['picture_large']['data']['url'], 
                username: profile['name']
              };

              console.log('Logged into Facebook!', this.userData);
            })
        })
        .catch(e => console.log('Error logging into Facebook', e));
    
    //this.fb.logEvent(this.fb.EVENTS.EVENT_NAME_ACTIVATED_APP);
  }
}
