import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import * as firebase from 'firebase';

import { FirebaseStorageService } from '../firebase-storage/firebase-storage.service';

export interface UserProfile {
  handle:       string;
  email:        string;
  first_name:   string;
  last_name:    string;
  full_name:    string;
  picture_url:  string;
}

export interface FeedItem {
  profile_handle:   string;
  full_name:        string;
  post_datetime:    string;
  post_dateobj:     number;
  db_path:          string; // location at mp3Collection
  doc_id:           string; // mp3Collection's document ID
  message:          string;
  likes:            number;
  // 0: Not available for feed / removed later by user
  // 1: Available for feed
  // 2: Forced removed from feed from application admin
  feed_status:      number; 
  feed_removed_date:    string;
  feed_removed_reason:  string;
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
  feedID:       string;
  metaData:     any;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseDBService {
  private feedItemCollection: AngularFirestoreCollection<FeedItem>;
  private feeds: Observable<FeedItem[]>;

  constructor(private objFirestore: AngularFirestore,
              private objFirebaseStorageService: FirebaseStorageService) { 
    
  }

  registerUser(profileData: UserProfile) {
    //this.objFirestore.collection('userProfile', ref => ref.where('email', "==", profileData.email)).snapshotChanges().subscribe(res => {
    this.objFirestore.collection('userProfile', ref => ref.where('email', "==", profileData.email)).get().subscribe(res => {
      if (res.size > 0)
      {
        console.log("Match found.");
        
        const first_name  = profileData.first_name;
        const last_name   = profileData.last_name;
        const full_name   = profileData.full_name;
        const picture_url = profileData.picture_url;

        res.forEach(function(doc) {
          doc.ref.update({first_name, last_name, full_name, picture_url}).then(() => {
            console.log("Profile information is updated with name and image.");
          }).catch(error => {
            console.log("Error updating profile data: " + error);
          });

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

  getUserProfile(email: string) : Promise<firebase.firestore.DocumentData> {
    
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
    const fieldID       = mp3MetaInfo.feedID;
    
    return new Promise((resolve, reject) => {
      this.objFirestore.doc(`mp3Collection/${handle}`).collection(albumName).add({
        createdAt,
        createdAtISO,
        fileName,
        customName,
        albumName,
        fullPath,
        contentType,
        fieldID
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
    const post_dateobj   = feedItem.post_dateobj;
    const post_datetime   = feedItem.post_datetime;
    const profile_handle  = feedItem.profile_handle;
    const full_name       = feedItem.full_name;
    const message         = feedItem.message;
    const likes           = feedItem.likes;
    const feed_status     = feedItem.feed_status;

    return new Promise((resolve, reject) => {
      this.objFirestore.collection('publicFeed').add({
        post_dateobj,
        post_datetime,
        profile_handle,
        full_name,
        db_path,
        doc_id,
        message,
        likes,
        feed_status
      })
      .then(docRef => {
        console.log("Public feed document successfully written!");
        
        // Update respective mp3Collection
        this.objFirestore.doc(db_path).update({feedID: docRef.id}).then(() => {
          
          console.error("feedID in mp3Collection updated successfully.");
          resolve(docRef);

        }).catch(error => {
          
          console.error("Error updating feedID in mp3Collection: ", error);
          reject(error);

        });
      })
      .catch(function(error) {
          console.error("Error writing public feed document: ", error);
          reject(error);
      });
    });
  }

  getMusicMetaInfoList(handle: string, album: string, offset: string, limit: number) : Observable<FileMetaInfo[]> {
    
    let mp3Collection: AngularFirestoreCollection<FileMetaInfo>;
    if(offset) {
      mp3Collection = this.objFirestore.collection<FeedItem>('mp3Collection')
        .doc(handle).collection(album, ref => ref
        .orderBy('createdAt', 'desc')
        .startAfter(offset)
        .limit(limit));
    }
    else {
      mp3Collection = this.objFirestore.collection<FeedItem>('mp3Collection')
        .doc(handle).collection(album, ref => ref
        .orderBy('createdAt', 'desc')
        .limit(limit));
    }
    
    let list = mp3Collection.snapshotChanges().pipe(take(1),
        map(actions => {
        //alert("Test - 5 : " + actions.length);
        return actions.map(a => {
          const data  = a.payload.doc.data();
          const id    = a.payload.doc.id;
          return {id, ...data}; 
        });
      })
    );

    return list;
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
              dataAry.push({'id': action.payload.doc.id, 'data': action.payload.doc.data()});
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

  getMusicMetadata(path: string) : Promise<FileMetaInfo> {
    
    return new Promise((resolve, reject) => { 
      this.objFirestore.doc(path).snapshotChanges()
        .subscribe(docSnapshot => {
          //console.log(docSnapshot);
          if (docSnapshot)
          {
            resolve(<FileMetaInfo>docSnapshot.payload.data());
          }
          else {
            reject("You haven't uploaded any music file yet!");
          }
        });
    });
  }

  getPublicFeedItem() : Observable<FeedItem[]> {
    this.feedItemCollection = this.objFirestore.collection<FeedItem>('publicFeed');
    this.feeds = this.feedItemCollection.snapshotChanges().pipe(take(1), 
      map(actions => {
        return actions.map(a => {
          const data  = a.payload.doc.data();
          const id    = a.payload.doc.id;
          return {id, ...data}; 
        });
      })
    );

    return this.feeds;
  }

  getPublicFeedItemWithOffset(offset: number, limit: number) : Observable<FeedItem[]> {
    if(offset) {
      this.feedItemCollection = this.objFirestore.collection<FeedItem>('publicFeed', ref => ref
                                  .orderBy('post_dateobj', 'desc')
                                  .startAfter(offset)
                                  .limit(limit));
    }
    else {
      this.feedItemCollection = this.objFirestore.collection<FeedItem>('publicFeed', ref => ref
                                  .orderBy('post_dateobj', 'desc')
                                  .limit(limit));
    }

    this.feeds = this.feedItemCollection.snapshotChanges().pipe(take(1),
      map(actions => {
        return actions.map(a => {
          const data  = a.payload.doc.data();
          const id    = a.payload.doc.id;
          return {id, ...data}; 
        });
      })
    );

    return this.feeds;
  }

  getProfileImageURL(handle: string) : Promise<string> {

    return new Promise((resolve, reject) => { 
      this.objFirestore.collection('userProfile', ref => ref.where('handle', "==", handle))
        .get().subscribe(res => {
          if (res.size > 0)
          {
            //console.log("Profile found with handle : " + handle);

            res.forEach(function(doc) {
              resolve(doc.data().picture_url);

              // doc.data() is never undefined for query doc snapshots
              //console.log("Profile picture URL : ", doc.data().picture_url);
            });
          }
          else {
            reject("Can't find user profile with handle : " + handle);
          }
        });
    });
  }

  editMusicMetadata(doc_path: string, album: string, title: string) : Promise<any> {
    
    return new Promise((resolve, reject) => { 
      this.objFirestore.doc(doc_path).get().subscribe(res => {
        if (res.exists)
        {
          if(res.data().hasOwnProperty('metaData')) {
            res.ref.update({
              albumName: album,
              customName: title,
              'metaData.common.title' : title,
              'metaData.common.album' : album
              }).then(() => {
                console.log("editMusicMetadata album and title updated successfully.");

                resolve();
              }).catch(error => {
                console.log("Error updating editMusicMetadata : " + error);

                reject(error);
              });
          }
          else {
            res.ref.update({
              albumName: album,
              customName: title,
              }).then(() => {
                console.log("editMusicMetadata album and title updated successfully.");

                resolve();
              }).catch(error => {
                console.log("Error updating editMusicMetadata : " + error);

                reject(error);
              });
          }
        }
      }, error => {
        console.log("Error getting mp3Collection for editMusicMetadata : " + error);

        reject(error);
      });
    });
  }

  deleteMusicMetadataAndFile(doc_path: string, file_path: string) : Promise<any> {

    return new Promise((resolve, reject) => { 
      this.objFirestore.doc(doc_path).get().subscribe(res => {
        console.log(res);
        this.objFirebaseStorageService.deleteFile(file_path).subscribe(() => {
          console.log("File deleted from storage ");
        }, error => {
          console.log("Error deleting file from storage : " + error);
        });

        if(res.exists) {
          if(res.data().feedID) {
            this.objFirestore.collection("publicFeed").doc(res.data().feedID).delete().then(() => {
              res.ref.delete().then(() => {
                resolve();
              }).catch(error => {
                console.log("Error deleting file from storage : " + error);

                reject(error);
              });
            }).catch(error => {
              console.log("Error deleting entry from public feed : " + error);

              reject(error);
            });
          }
          else {
            res.ref.delete().then(() => {
              resolve();
            }).catch(error => {
              console.log("Error deleting file from storage : " + error);

              reject(error);
            });
          }
        }
        else {
          resolve();
        }
      }, error => {
        console.log("Error getting mp3Collection for deleteMusicMetadataAndFile : " + error);

        reject(error);
      });
    });
  }

  searchAlbumOrTitle(searchNiddle: string, handle: string, album: string, offset: string, limit: number) : Observable<FileMetaInfo[]> {
    let mp3Collection: AngularFirestoreCollection<FileMetaInfo>;
    if(offset) {
      mp3Collection = this.objFirestore.collection<FeedItem>('mp3Collection')
        .doc(handle).collection(album, ref => ref
        .where('metaData.common.title', "==", searchNiddle)
        .where('metaData.common.album', "==", searchNiddle)
        .orderBy('createdAt', 'desc')
        .startAfter(offset)
        .limit(limit));
    }
    else {
      mp3Collection = this.objFirestore.collection<FeedItem>('mp3Collection')
        .doc(handle).collection(album, ref => ref
        .where('metaData.common.title', "==", searchNiddle)
        .where('metaData.common.album', "==", searchNiddle)
        .orderBy('createdAt', 'desc')
        .limit(limit));
    }
    
    let list = mp3Collection.snapshotChanges().pipe(take(1),
        map(actions => {
        //alert("Test - 5 : " + actions.length);
        return actions.map(a => {
          const data  = a.payload.doc.data();
          const id    = a.payload.doc.id;
          return {id, ...data}; 
        });
      })
    );

    return list;
  }
}
