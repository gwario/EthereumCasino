import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GamblingHallComponent } from './gambling-hall.component';

describe('GamblingHallComponent', () => {
  let component: GamblingHallComponent;
  let fixture: ComponentFixture<GamblingHallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GamblingHallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GamblingHallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
