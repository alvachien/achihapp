import { TestBed } from '@angular/core/testing';

import { FinanceStorageService } from './finance-storage.service';

describe('FinanceStorageService', () => {
  let service: FinanceStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinanceStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
