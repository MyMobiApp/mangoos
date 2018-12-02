import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MyMusicPage } from './my-music.page';

import { CommonComponentsModule } from '../common-components/common-components.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    CommonComponentsModule,
    RouterModule.forChild([{ path: '', component: MyMusicPage }])
  ],
  declarations: [MyMusicPage]
})
export class MyMusicPageModule {}
