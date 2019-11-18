import { TestBed, async, inject } from '@angular/core/testing';

import { Ec2IdGuard } from './ec2-id.guard';

describe('Ec2IdGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Ec2IdGuard]
    });
  });

  it('should ...', inject([Ec2IdGuard], (guard: Ec2IdGuard) => {
    expect(guard).toBeTruthy();
  }));
});
