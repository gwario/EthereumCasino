import { TestBed, inject } from '@angular/core/testing';

import { SlotmachineService } from './slotmachine.service';

describe('SlotmachineService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SlotmachineService]
    });
  });

  it('should be created', inject([SlotmachineService], (service: SlotmachineService) => {
    expect(service).toBeTruthy();
  }));
});
