import { TestBed, inject } from '@angular/core/testing';

import { AppMetaResolveService } from './app-meta-resolve.service';

describe('AppMetaResolveService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppMetaResolveService]
    });
  });

  it('should be created', inject(
    [AppMetaResolveService],
    (service: AppMetaResolveService) => {
      expect(service).toBeTruthy();
    }
  ));
});
