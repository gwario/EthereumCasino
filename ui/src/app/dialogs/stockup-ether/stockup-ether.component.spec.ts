import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StockupEtherComponent } from './stockup-ether.component';

describe('StockupEtherComponent', () => {
  let component: StockupEtherComponent;
  let fixture: ComponentFixture<StockupEtherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockupEtherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockupEtherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
