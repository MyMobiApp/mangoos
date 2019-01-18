import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from 'angularfire2/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class DBMaintenanceService {

  constructor(private objFirestore: AngularFirestore) { }

  convertPostDatetimeInFeedToNumber() : Promise <any>{

    return new Promise((resolve, reject) => { 
      this.objFirestore.collection('publicFeed')
        .get().subscribe(res => {
          if (res.size > 0)
          {
            res.forEach(function(doc) {
              
              doc.ref.set({post_dateobj: Date.parse(doc.data().post_datetime)}, { merge: true })
              .then(() => {
                console.log("Feed document is updated with post_dateobj.");
              }).catch(error => {
                console.log("Error updating feed document post_dateobj: " + error);
              });
            });
            resolve();
          }
          else {
            reject();
          }
        });
      });
  }
}
