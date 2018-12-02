import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedPage } from './feed.page';

import { CommonComponentsModule } from '../common-components/common-components.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    CommonComponentsModule,
    RouterModule.forChild([{ path: '', component: FeedPage }])
  ],
  declarations: [FeedPage]
})
export class FeedPageModule {}
