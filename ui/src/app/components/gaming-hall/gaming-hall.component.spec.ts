import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GamingHallComponent } from './gaming-hall.component';

describe('GamingHallComponent', () => {
  let component: GamingHallComponent;
  let fixture: ComponentFixture<GamingHallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GamingHallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GamingHallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
