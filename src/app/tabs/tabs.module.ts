import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsPageRoutingModule } from './tabs.router.module';

import { TabsPage } from './tabs.page';
import { MyMusicPageModule } from '../my-music/my-music.module';
import { PlaylistPageModule } from '../playlist/playlist.module';
import { SearchPageModule } from '../search/search.module';
import { FeedPageModule } from '../feed/feed.module';

import { CommonComponentsModule } from '../common-components/common-components.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabsPageRoutingModule,
    FeedPageModule,
    SearchPageModule,
    PlaylistPageModule,
    MyMusicPageModule,
    CommonComponentsModule
  ],
  declarations: [TabsPage]
})
export class TabsPageModule {}
