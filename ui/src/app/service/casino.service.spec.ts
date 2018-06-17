import { TestBed, inject } from '@angular/core/testing';

import { CasinoService } from './casino.service';

describe('CasinoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CasinoService]
    });
  });

  it('should be created', inject([CasinoService], (service: CasinoService) => {
    expect(service).toBeTruthy();
  }));
});
