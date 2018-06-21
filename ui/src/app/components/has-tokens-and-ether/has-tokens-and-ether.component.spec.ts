import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HasTokensAndEtherComponent } from './has-tokens-and-ether.component';

describe('HasTokensAndEtherComponent', () => {
  let component: HasTokensAndEtherComponent;
  let fixture: ComponentFixture<HasTokensAndEtherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HasTokensAndEtherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HasTokensAndEtherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
