import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyMusicPage } from './my-music.page';

describe('MyMusicPage', () => {
  let component: MyMusicPage;
  let fixture: ComponentFixture<MyMusicPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MyMusicPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyMusicPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
