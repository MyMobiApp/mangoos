import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MP3SettingsPage } from './mp3-settings.page';

const routes: Routes = [
  {
    path: '',
    component: MP3SettingsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MP3SettingsPage]
})
export class MP3SettingsPageModule {}
