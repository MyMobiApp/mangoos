import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import * as firebase from 'firebase';

export interface UserProfile {
  handle:       string;
  email:        string;
  first_name:   string;
  last_name:    string;
  full_name:    string;
  picture_url:  string;
}

export interface FeedItem {
  profile_handle: string;
  post_datetime:  string;
  db_path:        string; // location at mp3Collection
  doc_id:         string; // mp3Collection's document ID
  message:        string;
  likes:          number;
}

export interface Network {
  profile_id: string;
}

export interface PlaylistItem {
  item_id:        string;
  item_thumbnail: string;
  item_metadata:  any;
}

export interface FileMetaInfo {
  createdAtISO: string;
  createdAt:    string;
  fileName:     string;
  customName:   string;
  albumName:    string;
  fullPath:     string;
  contentType:  string;
  metaData:     any;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseDBService {
  private feedItemCollection: AngularFirestoreCollection<FeedItem>;
  private feeds: Observable<FeedItem[]>;

  constructor(private objFirestore: AngularFirestore) { 
    this.feedItemCollection = objFirestore.collection<FeedItem>('publicFeed');
    this.feeds = this.feedItemCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data  = a.payload.doc.data();
          const id    = a.payload.doc.id;
          return {id, ...data}; 
        })
      })
    );
  }

  registerUser(profileData: UserProfile) {
    //this.objFirestore.collection('userProfile', ref => ref.where('email', "==", profileData.email)).snapshotChanges().subscribe(res => {
    this.objFirestore.collection('userProfile', ref => ref.where('email', "==", profileData.email)).get().subscribe(res => {
      if (res.size > 0)
      {
        console.log("Match found.");
        res.forEach(function(doc) {
          // doc.data() is never undefined for query doc snapshots
          console.log(doc.id, " => ", doc.data());
        });
      }
      else
      {
        console.log("Does not exist.");

        profileData.handle = profileData.email.split('@').join('.');

        const id          = this.objFirestore.createId();
        const handle      = profileData.handle;
        const email       = profileData.email;
        const first_name  = profileData.first_name;
        const last_name   = profileData.last_name;
        const full_name   = profileData.full_name;
        const picture_url = profileData.picture_url;

        this.objFirestore.doc(`userProfile/${id}`).set({
          handle,
          email,
          first_name,
          last_name,
          full_name,
          picture_url
        })
        .then(function() {
          console.log("Document successfully written!");
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
        });
      }
    });
  }

  getUserProfile(email: string) : Promise<any> {
    
    return new Promise((resolve, reject) => { 
      this.objFirestore.collection('userProfile', ref => ref.where('email', "==", email))
        .get().subscribe(res => {
          if (res.size > 0)
          {
            console.log("Profile found.");
            res.forEach(function(doc) {
              resolve(doc.data());

              // doc.data() is never undefined for query doc snapshots
              console.log(doc.id, " => ", doc.data());
            });
          }
          else {
            reject();
          }
        });
    });
  }

  isUserExists(email: string) {
    var retVal = false;
    

    return retVal;
  }

  updateUser(profileData: UserProfile) {
    //this.objFirebase.
  }

  getFeeds() {
    return this.feeds;
  }

  getFeedItem(id: any) {
    return this.feedItemCollection.doc<FeedItem>(id).valueChanges();
  }

  updateFeedItem(feeditem: FeedItem, id: any) {
    return this.feedItemCollection.doc<FeedItem>(id).update(feeditem);
  }

  deleteDocWithRef(docRef: DocumentReference) {
    this.objFirestore.doc(docRef.path).delete().then(() => {
      // Deleted Successfully
    }).catch(reason => {
      console.log(reason);
    });
  }

  saveMyMP3(handle: string, mp3MetaInfo: FileMetaInfo) : Promise<firebase.firestore.DocumentReference> {
    const createdAtISO  = mp3MetaInfo.createdAtISO;
    const createdAt     = mp3MetaInfo.createdAt;
    const fileName      = mp3MetaInfo.fileName;
    const customName    = mp3MetaInfo.customName;
    const albumName     = mp3MetaInfo.albumName
    const fullPath      = mp3MetaInfo.fullPath;
    const contentType   = mp3MetaInfo.contentType;
    
    return new Promise((resolve, reject) => {
      this.objFirestore.doc(`mp3Collection/${handle}`).collection(albumName).add({
        createdAt,
        createdAtISO,
        fileName,
        customName,
        albumName,
        fullPath,
        contentType
      })
      .then(docRef => {
        console.log("Document successfully written!");
        resolve(docRef);
      })
      .catch(function(error) {
          console.error("Error writing document: ", error);
          reject(error);
      });
    });
  }

  saveItemToPublicFeed(feedItem: FeedItem) : Promise<firebase.firestore.DocumentReference> {
    const db_path         = feedItem.db_path;
    const doc_id          = feedItem.doc_id;
    const post_datetime   = feedItem.post_datetime;
    const profile_handle  = feedItem.profile_handle;
    const message         = feedItem.message;
    const likes           = feedItem.likes;

    return new Promise((resolve, reject) => {
      this.objFirestore.collection('publicFeed').add({
        post_datetime,
        profile_handle,
        db_path,
        doc_id,
        message,
        likes
      })
      .then(docRef => {
        console.log("Public feed document successfully written!");
        resolve(docRef);
      })
      .catch(function(error) {
          console.error("Error writing public feed document: ", error);
          reject(error);
      });
    });
  }

  getMusicFileList(handle: string, album: string) : Promise<any> {
    
    return new Promise((resolve, reject) => { 
      this.objFirestore.collection('mp3Collection').doc(handle).collection(album)
        .snapshotChanges()
        .subscribe(res => {
          //alert(res.size);
          if (res.length > 0)
          {
            let dataAry = Array();
            res.forEach(function(action) {
              dataAry.push({'id': action.payload.doc.id, 'data': action.payload.doc.data()})
              //alert(doc.id + " => " + JSON.stringify(doc.data()));
              // doc.data() is never undefined for query doc snapshots
            });
            resolve(dataAry);
          }
          else {
            reject("You haven't uploaded any music file yet!");
          }
        });
    });
  }
}
