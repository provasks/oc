import { TestBed, async, inject } from '@angular/core/testing';

import { EulaGuard } from './eula.guard';

describe('EulaGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EulaGuard]
    });
  });

  it('should ...', inject([EulaGuard], (guard: EulaGuard) => {
    expect(guard).toBeTruthy();
  }));
});
