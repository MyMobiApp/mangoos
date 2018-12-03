import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private profileDate: any;

  constructor() { }

  getProfileData() {
    return this.profileDate;
  }

  setProfileData(pd: any) {
    this.profileDate = pd;
  }
}
