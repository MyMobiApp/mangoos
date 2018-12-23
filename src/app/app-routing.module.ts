import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './login/login.module#LoginPageModule' },
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'MyProfile', loadChildren: './my-profile/my-profile.module#MyProfilePageModule' },
  { path: 'Settings', loadChildren: './settings/settings.module#SettingsPageModule' },
  { path: 'MP3Settings', loadChildren: './mp3-settings/mp3-settings.module#MP3SettingsPageModule' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
