import { TestBed, inject } from '@angular/core/testing';

import { GamblingHallService } from './gambling-hall.service';

describe('GamblingHallService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GamblingHallService]
    });
  });

  it('should be created', inject([GamblingHallService], (service: GamblingHallService) => {
    expect(service).toBeTruthy();
  }));
});
