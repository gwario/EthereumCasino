import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduceTokensComponent } from './produce-tokens.component';

describe('ProduceTokensComponent', () => {
  let component: ProduceTokensComponent;
  let fixture: ComponentFixture<ProduceTokensComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProduceTokensComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProduceTokensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
