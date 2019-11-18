import { TestBed, async, inject } from '@angular/core/testing';

import { SetAdminPasswordGuard } from './set-admin-password.guard';

describe('SetAdminPasswordGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SetAdminPasswordGuard]
    });
  });

  it('should ...', inject(
    [SetAdminPasswordGuard],
    (guard: SetAdminPasswordGuard) => {
      expect(guard).toBeTruthy();
    }
  ));
});
