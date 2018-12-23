import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MP3SettingsPage } from './mp3-settings.page';

describe('MP3SettingsPage', () => {
  let component: MP3SettingsPage;
  let fixture: ComponentFixture<MP3SettingsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MP3SettingsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MP3SettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
