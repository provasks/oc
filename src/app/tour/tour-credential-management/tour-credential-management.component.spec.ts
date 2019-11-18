import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TourCredentialManagementComponent } from './tour-credential-management.component';

describe('TourCredentialManagementComponent', () => {
  let component: TourCredentialManagementComponent;
  let fixture: ComponentFixture<TourCredentialManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TourCredentialManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TourCredentialManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
