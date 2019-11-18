import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TourUploadAsupComponent } from './tour-upload-asup.component';

describe('TourUploadAsupComponent', () => {
  let component: TourUploadAsupComponent;
  let fixture: ComponentFixture<TourUploadAsupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TourUploadAsupComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TourUploadAsupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
