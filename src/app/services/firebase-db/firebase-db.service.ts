import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UserProfile {
  handle:       string;
  email:        string;
  first_name:   string;
  last_name:    string;
  full_name:    string;
  picture_url:  string;
}

export interface FeedItem {
  profile_id:     string;
  post_datetime:  string;
  album_url:      string;
  music_url:      string[];
  message:        string;
  likes:          number;
}

export interface Network {
  profile_id: string;
}

export interface Playlist {

}

export interface FileMetaInfo {
  createdAt:    string;
  fileName:     string;
  customName:   string;
  albumName:    string;
  fullPath:     string;
  contentType:  string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseDBService {
  private feedItemCollection: AngularFirestoreCollection<FeedItem>;
  private feeds: Observable<FeedItem[]>;

  constructor(private objFirestore: AngularFirestore) { 
    this.feedItemCollection = objFirestore.collection<FeedItem>('FeedItem');
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

  saveMyMP3(handle: string, mp3MetaInfo: FileMetaInfo) {
    const createdAt   = mp3MetaInfo.createdAt;
    const fileName    = mp3MetaInfo.fileName;
    const customName  = mp3MetaInfo.customName;
    const albumName   = mp3MetaInfo.albumName
    const fullPath    = mp3MetaInfo.fullPath;
    const contentType = mp3MetaInfo.contentType;
    
    this.objFirestore.doc(`mp3Collection/${handle}`).collection(albumName).add({
      createdAt,
      fileName,
      customName,
      albumName,
      fullPath,
      contentType
    })
    .then(function() {
      console.log("Document successfully written!");
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
  }

  /*let ref = this.db.collection('files');

    return ref.snapshotChanges()
    .map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });*/
  getMP3List(handle: string, album: string) : Promise<any> {
    
    return new Promise((resolve, reject) => { 
      this.objFirestore.collection('mp3Collection').doc(handle).collection(album)
        .get().subscribe(res => {
          //alert(res.size);
          if (res.size > 0)
          {
            let dataAry = Array();
            res.forEach(function(doc) {
              dataAry.push({'id': doc.id, 'data': doc.data()})
              //alert(doc.id + " => " + JSON.stringify(doc.data()));
              // doc.data() is never undefined for query doc snapshots
            });
            resolve(dataAry);
          }
          else {
            reject();
          }
        });
    });
  }
}
