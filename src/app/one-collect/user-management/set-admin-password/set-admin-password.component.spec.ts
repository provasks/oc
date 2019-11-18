import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetAdminPasswordComponent } from './set-admin-password.component';

describe('SetAdminPasswordComponent', () => {
  let component: SetAdminPasswordComponent;
  let fixture: ComponentFixture<SetAdminPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SetAdminPasswordComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetAdminPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
