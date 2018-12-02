import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedAudioItemComponent } from './feed-audio-item.component';

describe('FeedAudioItemComponent', () => {
  let component: FeedAudioItemComponent;
  let fixture: ComponentFixture<FeedAudioItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedAudioItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedAudioItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
