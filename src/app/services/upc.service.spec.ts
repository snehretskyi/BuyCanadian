import { TestBed } from '@angular/core/testing';

import { UpcService } from './upc.service';

describe('UpcService', () => {
  let service: UpcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
