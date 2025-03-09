import { TestBed } from '@angular/core/testing';

import { UIStatusService } from './uistatus.service';

describe('UIStatusService', () => {
  let service: UIStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UIStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Set Fatal Error', () => {
    service.fatalError = true;
    service.latestError = 'failed';
    
    expect(service.fatalError).not.toBeNull();
    expect(service.latestError).not.toBeNull();
    expect(service.latestError).toMatch('fail');
  });
});
