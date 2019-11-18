import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TourDeviceBasedComponent } from './tour-device-based.component';

describe('TourDeviceBasedComponent', () => {
  let component: TourDeviceBasedComponent;
  let fixture: ComponentFixture<TourDeviceBasedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TourDeviceBasedComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TourDeviceBasedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
