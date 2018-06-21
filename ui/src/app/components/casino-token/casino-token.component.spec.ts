import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasinoTokenComponent } from './casino-token.component';

describe('CasinoTokenComponent', () => {
  let component: CasinoTokenComponent;
  let fixture: ComponentFixture<CasinoTokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CasinoTokenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasinoTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
