import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeTokenPriceComponent } from './change-token-price.component';

describe('ChangeTokenPriceComponent', () => {
  let component: ChangeTokenPriceComponent;
  let fixture: ComponentFixture<ChangeTokenPriceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeTokenPriceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeTokenPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
