import { TestBed, inject } from '@angular/core/testing';

import { CasinoTokenService } from './casino-token.service';

describe('CasinoTokenService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CasinoTokenService]
    });
  });

  it('should be created', inject([CasinoTokenService], (service: CasinoTokenService) => {
    expect(service).toBeTruthy();
  }));
});
