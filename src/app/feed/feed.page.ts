import { Component, ViewChild } from '@angular/core';
import { InfiniteScroll } from '@ionic/angular';

import { FirebaseDBService, FeedItem } from 'src/app/services/firebase-db/firebase-db.service';
import { DataService } from 'src/app/services/data/data.service';

@Component({
  selector: 'app-feed',
  templateUrl: 'feed.page.html',
  styleUrls: ['feed.page.scss']
})
export class FeedPage {
  @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
 
  private feedItemAry: FeedItem[];
  offset: number  = null;
  limit: number   = 20;

  constructor(private dataService: DataService,
              private firebaseDBService: FirebaseDBService) { }

  ngOnInit() {
    this.fetchFeedItems(null);
  }

  fetchFeedItems(event) {
    let _me_ = this;

    //alert(_me_.offset);
    this.firebaseDBService.getPublicFeedItemWithOffset(_me_.offset, _me_.limit)
        .subscribe(feedItemAry => {
      if(_me_.feedItemAry && feedItemAry.length > 0) {
        _me_.feedItemAry = _me_.feedItemAry.concat(feedItemAry);
        _me_.offset = feedItemAry[feedItemAry.length - 1].post_dateobj;
      }
      else if(feedItemAry.length > 0) {
        _me_.feedItemAry = feedItemAry;
        _me_.offset = feedItemAry[feedItemAry.length - 1].post_dateobj;
      }
      
      //console.log("Fetched Array");
      //console.log(feedItemAry);
      //console.log("Complete Array");
      //console.log(_me_.feedItemAry);
      if(event) {
        event.target.complete();
        if(feedItemAry.length == 0) {
          event.target.disabled = true;
        }
      }
    });
  }

  doRefresh(event) {
    //console.log('Begin async operation', event);

    this.offset = null;
    this.feedItemAry = null;

    this.fetchFeedItems(null);

    event.target.complete();
  }
}
