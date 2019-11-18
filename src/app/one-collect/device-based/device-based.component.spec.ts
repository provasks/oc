import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceBasedComponent } from './device-based.component';

describe('DeviceBasedComponent', () => {
  let component: DeviceBasedComponent;
  let fixture: ComponentFixture<DeviceBasedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DeviceBasedComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceBasedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
