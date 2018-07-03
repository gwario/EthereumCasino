import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeExchangeFeeComponent } from './change-exchange-fee.component';

describe('ChangeExchangeFeeComponent', () => {
  let component: ChangeExchangeFeeComponent;
  let fixture: ComponentFixture<ChangeExchangeFeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeExchangeFeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeExchangeFeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
