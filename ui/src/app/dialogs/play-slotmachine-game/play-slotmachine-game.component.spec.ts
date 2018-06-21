import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaySlotmachineGameComponent } from './play-slotmachine-game.component';

describe('PlaySlotmachineGameComponent', () => {
  let component: PlaySlotmachineGameComponent;
  let fixture: ComponentFixture<PlaySlotmachineGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaySlotmachineGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaySlotmachineGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
