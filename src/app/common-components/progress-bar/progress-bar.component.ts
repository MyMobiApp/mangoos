import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from 'src/app/services/data/data.service';
import { FirebaseDBService } from 'src/app/services/firebase-db/firebase-db.service';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements OnInit {
  @Input() progress: any;
  @Output() feedAction =  new EventEmitter();

  feedMsg: string = "";
  bUploading: boolean = false;
  bStarting: boolean = true;

  constructor(private dataService: DataService,
              private firebaseDBService: FirebaseDBService) { }

  ngOnInit() {
    
  }

  onPost() {
    let _me_ = this;
    let feedItem = this.dataService.getPublicFeedItem();
    feedItem.message = this.feedMsg;

    this.firebaseDBService.saveItemToPublicFeed(feedItem).then(docRef => {
      _me_.bUploading = false;
      _me_.bStarting  = true;
      _me_.progress   = 0;
      _me_.feedMsg    = "";

      _me_.dataService.setPublicFeedItem(null);
      _me_.feedAction.emit(true);
      console.log("Document to Public Feed written successfully! : " + docRef.id);
    });
  }

  onIgnore() {
    this.bUploading = false;
    this.progress = 0;
    this.feedMsg = "";
    this.feedAction.emit(false);
  }

}
