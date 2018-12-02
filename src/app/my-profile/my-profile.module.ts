import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MyProfilePage } from './my-profile.page';

import { CommonComponentsModule } from '../common-components/common-components.module';

const routes: Routes = [
  {
    path: '',
    component: MyProfilePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommonComponentsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MyProfilePage]
})
export class MyProfilePageModule {}
