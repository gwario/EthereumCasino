import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Slotmachine10GameComponent } from './slotmachine-1-0-game.component';

describe('Slotmachine10GameComponent', () => {
  let component: Slotmachine10GameComponent;
  let fixture: ComponentFixture<Slotmachine10GameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Slotmachine10GameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Slotmachine10GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
