import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemFeedPlayerComponent } from './item-feed-player.component';

describe('ItemFeedPlayerComponent', () => {
  let component: ItemFeedPlayerComponent;
  let fixture: ComponentFixture<ItemFeedPlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemFeedPlayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemFeedPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
