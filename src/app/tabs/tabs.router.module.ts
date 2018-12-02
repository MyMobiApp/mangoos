import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';
import { FeedPage } from '../feed/feed.page';
import { SearchPage } from '../search/search.page';
import { PlaylistPage } from '../playlist/playlist.page';
import { MyMusicPage } from '../my-music/my-music.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: '',
        redirectTo: '/tabs/(feed:feed)',
        pathMatch: 'full',
      },
      {
        path: 'feed',
        outlet: 'feed',
        component: FeedPage
      },
      {
        path: 'search',
        outlet: 'search',
        component: SearchPage
      },
      {
        path: 'playlist',
        outlet: 'playlist',
        component: PlaylistPage
      },
      {
        path: 'my-music',
        outlet: 'my-music',
        component: MyMusicPage
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/(feed:feed)',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
