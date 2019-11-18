import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TourUserManagementComponent } from './tour-user-management.component';

describe('TourUserManagementComponent', () => {
  let component: TourUserManagementComponent;
  let fixture: ComponentFixture<TourUserManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TourUserManagementComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TourUserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
