import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { HeaderComponent } from './header/header.component';
import { FeedAudioItemComponent } from './feed-audio-item/feed-audio-item.component';
import { MiniPlayerComponent } from './mini-player/mini-player.component';
import { ItemFeedPlayerComponent } from './item-feed-player/item-feed-player.component';
import { UploadComponent } from './upload/upload.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    HeaderComponent, 
    FeedAudioItemComponent, 
    MiniPlayerComponent, 
    ItemFeedPlayerComponent, UploadComponent, ProgressBarComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,     //https://github.com/ionic-team/ionic/issues/14868
    ReactiveFormsModule
  ],
  exports: [
    HeaderComponent, 
    FeedAudioItemComponent, 
    MiniPlayerComponent, 
    ItemFeedPlayerComponent, UploadComponent, ProgressBarComponent
  ]
})
export class CommonComponentsModule { }

// --------------------------------------------------
// Tutorial
// --------------------------------------------------
// 
// https://angularfirebase.com/snippets/how-manage-shared-components-in-an-ionic-4-app/
// https://www.youtube.com/watch?v=z3fuSMNQmY4
